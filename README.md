# Tetris

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.5.

Un sencillo juego de Tetris implementado en Angular utilizando Signals para la reactividad y una arquitectura modular.

## Características

- **Juego clásico de Tetris** con piezas O, I, T, S, Z, J, L.
- Rederizado del tablero principal y pieza siguiente.
- Señales de Angular para la reactividad (Tablero, Puntuación, Nivel, Game Over).
- Pipe **zerofill** para formatear la puntuación.
- Soporte de **Local Storage** para guardar la puntuación máxima.
- Control de teclado para mover y rotar las piezas: Flechas, Enter y Escape.
- Diseño responsivo con CSS y Flexbox.
- Estilo retro usando colores vibrantes y tipografía de estilo arcade.

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/marckux-dev/tetris.git
    cd tetris
    ```
2. Instala las dependencias:
  ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
    ng serve
    ```
4. Abre tu navegador y visita `http://localhost:4200/`.

# Uso
- Usa las flechas del teclado para mover las piezas:
  - **Izquierda**: Mover pieza a la izquierda.
  - **Derecha**: Mover pieza a la derecha.
  - **Arriba**: Rotar pieza.
  - **Abajo**: Acelerar caída de la pieza.
  - **Enter**: Empezar o reanudar el juego.
  - **Escape**: Reiniciar el juego.

# Licencia
MIT License 2025 marckux-dev
