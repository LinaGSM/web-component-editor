import './libs/pixi.js';
import Editor from './editor.js';

//pour la scrollbar: overflow scrollbar css

export default class MyEditor extends HTMLElement {
  style = `
    .rotated {
      width: 100px;
      height: 100px;
      background-color: darkmagenta;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: rotate(90deg);
      /* Rotation de 90 degrés */
    }


    .Editeur {
      display: flex;
      /* Active Flexbox */
      flex-direction: column;
      /* Empile les éléments verticalement */
      align-items: flex-start;
      /* Aligne à gauche (par défaut) */
      //background-color: rgba(139, 0, 139, 0.37);
    }

    .grille {
      display: flex;
      /* Conteneur Flex pour 'milieu' et 'droite' */
      flex-direction: row;
      /* Place à droite de 'milieu' */
      align-items: center;
      /* Aligne verticalement les éléments */
      padding: 10px;
      /* S'étend pour inclure 'droite' */
    }

    #sliderScrollVertical {
      margin-left: auto;
      /* Pousse à l'extrême droite */
      padding: 10px;
    }

    #sliderScrollHorizontal {
      margin-top: 10px;
      /* Crée un espace sous 'milieu' */
      padding: 10px;
      width: 100%;
    }
    #editeur {
        background-color: rgba(0, 139, 2, 0.37);
}`;
  html = `
<script src="https://pixijs.download/release/pixi.js"></script>

<script type="module" src="./mycomponents/editor.js"></script>
<div id="editeur">
  

  <input type="range" id="sliderZoomHorizontal" min="0.34" max="3" step="0.01" value="1">
  <span id="scaleXValue">1</span>

  <input type="range" id="sliderZoomVertical" min="0.3" max="1" step="0.001" value="1">

  <span id="scaleYValue">1</span>

  <button id="play">Play</button>

  <h1>Premier test pixi </h1>
  <div class="Editeur">
    <div class="grille">
      <!--<canvas id="piano"></canvas>-->
      <canvas-editor id="piano"></canvas-editor> 
    </div>

    <input class="rotated" type="range" id="sliderScrollVertical" min="0" max="1" step="0.001" value="0">
    <input type="range" id="sliderScrollHorizontal" min="0" max="100" step="0.01" value="1">

  </div>
</div>`;

  constructor() {
    super();
    console.log('constructor called');
    // initialize the shadow DOM
    this.root = this.attachShadow({ mode: 'open' });
    this.scaleXValue = 1;
    this.scaleYValue = 1;
    this.isPlaying = false;
    this.scrollValueVertical = 0;
    this.scrollValueHorizontal = 0;
  }



  connectedCallback() {
    console.log('connectedCallback called');

    // Create HTML and CSS for the component
    this.root.innerHTML = `
        <style>${this.style}</style>
        ${this.html}
        `;
    //customElements.define('canvas-editor', Editor);

    this.editor = this.root.querySelector('#piano');
    this.addListeners();
  }

  addListeners() {
    // Add event listeners for the slider inputs and button
    this.root.querySelector('#sliderZoomHorizontal').addEventListener('input', (event) => {
      this.scaleXValue = event.target.value;
      this.root.querySelector('#scaleXValue').textContent = this.scaleXValue;
      this.editor.zoom(this.scaleXValue, this.scaleYValue);
    });

    this.root.querySelector('#sliderZoomVertical').addEventListener('input', (event) => {
      this.scaleYValue = event.target.value;
      this.root.querySelector('#scaleYValue').textContent = this.scaleYValue;
      this.editor.zoom(this.scaleXValue, this.scaleYValue);
    });

    this.root.querySelector('#play').addEventListener('click', () => {
      // Call the function to play or perform any action when the button is clicked
      this.isPlaying = !this.isPlaying; // Bascule entre Play et Pause

      // Change le texte du bouton en fonction de l'état
      this.root.querySelector('#play').textContent = this.isPlaying ? "⏸ Pause" : "▶ Play";
      //this.editor.playCurseur(this.isPlaying);


      //Attention le curseur accélère à chaque play
      if (this.isPlaying) {
        //this.editor.playCurseur(this.isPlaying);
        this.editor.app.ticker.add(() => {
          if(!this.isPlaying) return; // Si pas en mode lecture, ne rien faire
          this.editor.curseur.x += 1;
          if (this.editor.curseur.x > this.editor.worldWidth) {
            this.editor.curseur.x = 300;
          }

        });
      } 

      console.log("État du bouton Play:", this.isPlaying); // Debug: voir l'état dans la console
    });


    this.root.querySelector('#sliderScrollVertical').addEventListener('input', (event) => {
      this.scrollValueVertical = event.target.value;
      console.log('Scroll Vertical:', this.scrollValueVertical);
      this.editor.scroll(this.scrollValueHorizontal, this.scrollValueVertical);
      //this.editor.y = this.scrollValueVertical * 10;
      // Call the function to update the canvas or perform any action with the new value
    });

    this.root.querySelector('#sliderScrollHorizontal').addEventListener('input', (event) => {
      this.scrollValueHorizontal = event.target.value;
      console.log('Scroll Horizontal:', this.scrollValueHorizontal);
      this.editor.scroll(this.scrollValueHorizontal, this.scrollValueVertical);
      //this.editor.x = this.scrollValueHorizontal * 10;
      //Call the function to update the canvas or perform any action with the new value
    });

  }

}

customElements.define('mon-editeur', MyEditor);