# Último reparto

Juego de conducción y entregas con Phaser 3.90.0. Christian David Pisco García · JUEG GR3.

## Jugar

`npm start` y abre http://127.0.0.1:4173/mi-primer-juego/ . No hay dependencias que instalar. También funciona con Live Server.

Elige 3, 5 o 7 paquetes en el taller. Recórrelos en el orden que quieras y vuelve al círculo del taller cuando hayas entregado todos. Para entregar debes detenerte dentro del círculo durante 0,8 segundos. El indicador superior propone el destino pendiente más cercano; el minimapa muestra todos.

- Flecha arriba / W: acelerar.
- Izquierda y derecha / A y D: girar. La moto necesita movimiento para girar.
- Abajo / S: frenar y retroceder al mantener pulsado. En móvil, botón R.
- Espacio: frenar hasta detenerse, sin retroceder (útil para entregar).
- P / Escape: pausa; R en teclado: reiniciar turno.
- Controles táctiles y sonido opcional.

La carga reduce velocidad máxima y capacidad de giro. Cada entrega aligera la moto. Frena antes de doblar: a velocidad alta necesitas una curva más amplia. El tráfico y las paredes dañan los paquetes; los golpes rápidos hacen más daño. Pierdes al agotar tiempo o integridad. Los contratos tienen 100, 120 y 140 segundos. No hay vidas limitadas: puedes reintentar.

La recompensa depende de entregas, tiempo sobrante e integridad. Se conserva un récord por contrato en localStorage, cuando el navegador lo permite.

## Implementación

- `mi-primer-juego/index.html` y `delivery.css`: taller ilustrado y HUD.
- `src/delivery.js`: escena Phaser, tráfico, turnos, colisiones y entregas.
- `src/delivery-rules.js`: conducción, carga, destinos y reglas comprobables.
- `src/delivery-art.js`: ciudad y vehículos dibujados con Graphics de Phaser.
- `src/loader.js`: Phaser por CDN con respaldo local tras error o demora.
- `vendor/`: Phaser 3.90.0 oficial y licencia MIT.

Los archivos de los prototipos anteriores permanecen como referencia, pero no se cargan. El juego actual no usa clones ni infiltración. Gráficos vectoriales propios, sin imágenes ni fuentes externas.

## Verificación

`npm test` verifica carga, frenado, reversa, condiciones de entrega, colisiones, conectividad de destinos y puntuación. `npm run check` verifica sintaxis. Prueba manual realizada: menú, selección de contrato, aceleración, frenado y entrega real que actualiza el contador y aligera la moto. Las pruebas no equivalen a completar todos los contratos en dispositivos físicos.

## GitHub Pages

Sube los archivos al repositorio y configura Settings → Pages → Deploy from a branch → rama principal → /(root). El index de la raíz redirige a mi-primer-juego/. El trabajo local no implica publicación.

URL prevista según el remoto: https://2026b-sof-jueg-gr1.github.io/pisco-garcia-christian-david-jueg-gr3/mi-primer-juego/
