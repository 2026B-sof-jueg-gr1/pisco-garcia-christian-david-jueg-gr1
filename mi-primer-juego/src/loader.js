/* Phaser 3 por CDN, con respaldo local para conexiones lentas o sin Internet. */
(() => {
  const load = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src; script.onload = resolve; script.onerror = reject;
    document.body.appendChild(script);
  });
  async function boot() {
    // El límite evita que una conexión al CDN deje la pantalla bloqueada.
    await Promise.race([
      load('https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('CDN timeout')), 2500))
    ]).catch(() => window.Phaser ? undefined : load('./vendor/phaser.min.js'));
    await load('./src/delivery-rules.js');
    await load('./src/delivery-art.js');
    await load('./src/delivery.js');
  }
  boot().catch(() => {
    document.querySelector('#title').textContent = 'La moto no arranca.';
    document.querySelector('#copy').textContent = 'No se pudo cargar el juego. Recarga la página o comprueba que la carpeta vendor esté completa.';
    const button = document.querySelector('#play');
    button.disabled = false; button.textContent = 'Reintentar'; button.onclick = () => location.reload();
  });
})();
