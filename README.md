# Wallpaper de Gallo 3D Animado

Un fondo de pantalla interactivo con un gallo 3D construido con Three.js. El gallo camina, sigue el cursor del mouse y respira de forma natural.

## Características

- **Ciclo de caminata animado** con movimiento realista
- **Seguimiento de cabeza** que sigue el cursor del mouse
- **Animación de respiración** para un efecto más real
- **Fondo de estrellas** con estética espacial
- **Renderizado de profundidad optimizado** para evitar errores visuales

## Cómo ejecutar localmente

1. Clona este repositorio
2. Inicia un servidor local (necesario para cargar modelos 3D):
   ```bash
   npx http-server
   ```
3. Abre `http://localhost:8080` en tu navegador

## Cómo usar como fondo de pantalla en Windows

### Llively Wallpaper

1. Descarga e instala **Lively Wallpaper** desde:
   - [Microsoft Store](https://www.microsoft.com/store/apps/9ntm2qc6qws7)
   - O desde [GitHub](https://github.com/rocksdanister/lively/releases)

2. Abre Lively Wallpaper

3. Haz clic en el botón `+` (Add Wallpaper)

4. Selecciona "Web URL/File"

5. Navega hasta la carpeta de este proyecto y selecciona `index.html`

6. Haz clic derecho en el wallpaper → "Set as Wallpaper"

## Tecnologías

- Three.js para renderizado 3D
- GLTFLoader para cargar modelos 3D
- JavaScript vanilla (sin frameworks)

## Archivos

- `index.html` - Archivo HTML principal
- `script.js` - Lógica de Three.js y animaciones
- `style.css` - Estilos básicos
- `rooster.glb` - Modelo 3D del gallo con animaciones
- `LivelyInfo.json` - Configuración para Lively Wallpaper

## Uso

Mueve el mouse por la pantalla y observa cómo el gallo te sigue con la cabeza. El cuerpo gira ligeramente pero nunca muestra la espalda.

## Créditos

Hecho por @Cesarluque31, figura 3D realizada con Meshy.
