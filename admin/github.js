/* Acceso al repositorio de GitHub desde el navegador.
   El sitio no tiene servidor: guardar contenido significa hacer un commit en el
   repositorio, y GitHub Pages vuelve a publicar el sitio solo. */

(function (global) {
  const API = 'https://api.github.com';

  function bytesAB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function b64ATexto(b64) {
    const bin = atob(String(b64).replace(/\s/g, ''));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  const ruta = (p) => p.split('/').map(encodeURIComponent).join('/');

  class Repo {
    constructor({ owner, repo, branch, token }) {
      this.owner = owner;
      this.repo = repo;
      this.branch = branch;
      this.token = token;
      this.base = '/repos/' + owner + '/' + repo;
    }

    async api(metodo, camino, cuerpo) {
      const r = await fetch(API + camino, {
        method: metodo,
        cache: 'no-store',
        headers: Object.assign({
          Authorization: 'Bearer ' + this.token,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }, cuerpo ? { 'Content-Type': 'application/json' } : {}),
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      if (!r.ok) {
        let msg = r.statusText;
        try { msg = (await r.json()).message || msg; } catch (e) { /* sin cuerpo */ }
        const err = new Error('GitHub ' + r.status + ': ' + msg);
        err.status = r.status;
        throw err;
      }
      return r.status === 204 ? null : r.json();
    }

    /* Comprueba que el token existe y puede escribir en el repositorio.
       `permissions` de /repos describe a la cuenta, no al token, así que se prueba
       escribiendo de verdad un blob suelto: no toca ninguna rama y, como siempre tiene
       el mismo contenido, es siempre el mismo objeto. */
    async verificar() {
      await this.api('GET', this.base);
      try {
        await this.api('POST', this.base + '/git/blobs', { content: 'panel', encoding: 'utf-8' });
      } catch (e) {
        if (e.status === 403 || e.status === 404) {
          const err = new Error('El token no tiene permiso para guardar: en GitHub, dale el permiso Contents → Read and write.');
          err.status = 403;
          throw err;
        }
        throw e;
      }
    }

    // Lista de todas las rutas de archivo de la rama.
    async archivos() {
      const d = await this.api('GET', this.base + '/git/trees/' + encodeURIComponent(this.branch) + '?recursive=1');
      return d.tree.filter((x) => x.type === 'blob').map((x) => x.path);
    }

    async leerTexto(camino) {
      const d = await this.api('GET', this.base + '/contents/' + ruta(camino) + '?ref=' + encodeURIComponent(this.branch));
      return b64ATexto(d.content);
    }

    // URL pública de un archivo, sin esperar a que GitHub Pages publique.
    urlCruda(camino) {
      return 'https://raw.githubusercontent.com/' + this.owner + '/' + this.repo + '/' +
        encodeURIComponent(this.branch) + '/' + ruta(camino);
    }

    /* Un solo commit con todos los cambios.
       cambios: [{ path, texto }] | [{ path, bytes: Uint8Array }] | [{ path, borrar: true }] */
    async commit(mensaje, cambios, alProgresar) {
      const avisar = alProgresar || (() => {});
      const binarios = cambios.filter((c) => c.bytes);
      let hechos = 0;
      const entradas = [];

      for (const c of cambios) {
        const entrada = { path: c.path, mode: '100644', type: 'blob' };
        if (c.borrar) entrada.sha = null;
        else if (c.texto !== undefined) entrada.content = c.texto;
        else {
          avisar('Subiendo imagen ' + (hechos + 1) + ' de ' + binarios.length + '…');
          const blob = await this.api('POST', this.base + '/git/blobs', {
            content: bytesAB64(c.bytes), encoding: 'base64',
          });
          entrada.sha = blob.sha;
          hechos++;
        }
        entradas.push(entrada);
      }

      avisar('Guardando cambios…');
      for (let intento = 0; ; intento++) {
        const ref = await this.api('GET', this.base + '/git/ref/heads/' + encodeURIComponent(this.branch));
        const padre = ref.object.sha;
        const base = await this.api('GET', this.base + '/git/commits/' + padre);
        const arbol = await this.api('POST', this.base + '/git/trees', { base_tree: base.tree.sha, tree: entradas });
        const nuevo = await this.api('POST', this.base + '/git/commits', {
          message: mensaje, tree: arbol.sha, parents: [padre],
        });
        try {
          await this.api('PATCH', this.base + '/git/refs/heads/' + encodeURIComponent(this.branch), { sha: nuevo.sha });
          return nuevo;
        } catch (e) {
          // 422: alguien hizo otro commit mientras tanto. Se reintenta sobre el nuevo.
          if (e.status !== 422 || intento >= 2) throw e;
        }
      }
    }
  }

  global.RepoGitHub = Repo;
})(typeof window !== 'undefined' ? window : globalThis);
