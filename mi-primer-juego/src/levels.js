/* Coordenadas en casillas. Las paredes y puertas comparten la misma cuadrícula. */
(function (root) {
  const vertical = (x, gaps) => Array.from({ length: 10 }, (_, i) => [x, i + 1]).filter(([, y]) => !gaps.includes(y));
  const horizontal = (y, start, end, gaps = []) => Array.from({ length: end - start + 1 }, (_, i) => [start + i, y]).filter(([x]) => !gaps.includes(x));
  const levels = [
    { name: 'La primera huella', subtitle: 'Aprende a estar en dos lugares.',
      hint: 'Pulsa ESPACIO, camina al interruptor A y pulsa ESPACIO otra vez. Tu eco se quedará allí.',
      solution: 'Graba un recorrido que termine en A. Espera a que el eco llegue y cruza la puerta. Reúne los dos fragmentos y entra en la salida.',
      spawn: [3, 6], exit: [17, 5], walls: vertical(10, [5, 6]),
      plates: [{ id: 'A', at: [5, 3] }], gates: [{ at: [10, 5], size: [1, 2], needs: ['A'] }],
      shards: [[7, 8], [14, 3]], drones: [], limit: 1 },
    { name: 'Memoria vigilada', subtitle: 'El pasado no teme a los drones.',
      hint: 'Los drones solo dañan a tu yo presente. Deja un eco en A y observa su patrulla antes de cruzar.',
      solution: 'Deja un eco en A. Rodea el bloque central por arriba o abajo, recoge los fragmentos y cruza la puerta. Los drones siguen siempre el mismo recorrido.',
      spawn: [2, 8], exit: [17, 3], walls: [...vertical(11, [7, 8]), ...horizontal(5, 3, 7)],
      plates: [{ id: 'A', at: [3, 2] }], gates: [{ at: [11, 7], size: [1, 2], needs: ['A'] }],
      shards: [[8, 2], [8, 8], [15, 8]], drones: [{ from: [6, 7], to: [9, 7], speed: 105 }, { from: [14, 3], to: [14, 9], speed: 90 }], limit: 1 },
    { name: 'A dos voces', subtitle: 'Dos recuerdos. Una misma puerta.',
      hint: 'Ahora puedes crear dos ecos. La puerta necesita A y B activos al mismo tiempo.',
      solution: 'Graba un eco que termine en A y otro que termine en B. Con ambos interruptores activos, la puerta permanece abierta. Puedes borrar el último con Q.',
      spawn: [3, 6], exit: [17, 6], walls: [...vertical(11, [5, 6]), ...horizontal(5, 4, 7), ...horizontal(7, 4, 7)],
      plates: [{ id: 'A', at: [5, 2] }, { id: 'B', at: [5, 9] }], gates: [{ at: [11, 5], size: [1, 2], needs: ['A', 'B'] }],
      shards: [[8, 6], [14, 2], [15, 9]], drones: [{ from: [13, 4], to: [17, 4], speed: 105 }], limit: 2 },
    { name: 'Efecto dominó', subtitle: 'Cada recuerdo abre el siguiente.',
      hint: 'A abre el primer sector. B abre el segundo. Conserva el primer eco mientras grabas el siguiente.',
      solution: 'Deja un eco en A y cruza la primera puerta. Desde el sector central, graba otro que termine en B. Recoge también el fragmento del sector inicial.',
      spawn: [2, 6], exit: [17, 3], walls: [...vertical(7, [7, 8]), ...vertical(13, [3, 4])],
      plates: [{ id: 'A', at: [4, 3] }, { id: 'B', at: [10, 8] }], gates: [{ at: [7, 7], size: [1, 2], needs: ['A'] }, { at: [13, 3], size: [1, 2], needs: ['B'] }],
      shards: [[3, 9], [10, 2], [16, 8]], drones: [{ from: [9, 5], to: [11, 5], speed: 100 }, { from: [15, 5], to: [17, 5], speed: 110 }], limit: 2 },
    { name: 'El último instante', subtitle: 'El archivo recuerda quién eres.',
      hint: 'La última salida necesita los dos ecos. Planifica tus recorridos y aprovecha los pasillos seguros.',
      solution: 'Deja el primer eco en A para abrir el acceso al centro. Deja el segundo en B, dentro del sector central. La última puerta necesita ambos. Recoge los tres fragmentos y sal.',
      spawn: [2, 6], exit: [17, 6], walls: [...vertical(7, [3, 4]), ...vertical(13, [7, 8]), ...horizontal(6, 9, 11)],
      plates: [{ id: 'A', at: [4, 8] }, { id: 'B', at: [10, 3] }], gates: [{ at: [7, 3], size: [1, 2], needs: ['A'] }, { at: [13, 7], size: [1, 2], needs: ['A', 'B'] }],
      shards: [[4, 2], [10, 9], [16, 3]], drones: [{ from: [8, 5], to: [12, 5], speed: 105 }, { from: [15, 3], to: [15, 9], speed: 100 }, { from: [16, 8], to: [18, 8], speed: 80 }], limit: 2 }
  ];
  levels.forEach((level,i)=>{
    level.hint = i<2 ? 'Solo un eco en movimiento carga los sensores. Graba una ruta que los atraviese y cruza la puerta durante sus 4,5 segundos de carga.' : 'Cada sensor conserva su carga 4,5 segundos. Haz que las rutas de tus dos ecos activen los sensores con suficiente coincidencia para cruzar.';
    level.solution = 'Empieza a grabar dos casillas antes del sensor, crúzalo y termina dos casillas después. El eco recorrerá esa ruta de ida y vuelta. Aprovecha su paso para cruzar. En puertas dobles, repite con el segundo sensor. Q borra el último eco; R reinicia la sala.';
  });
  root.ECO_LEVELS = levels;
  if (typeof module !== 'undefined') module.exports = levels;
})(globalThis);
