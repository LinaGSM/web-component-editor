import './libs/pixi.js';
import Editor from './editor.js';
import Piano from './piano.js';

//pour la scrollbar: overflow scrollbar css

export default class MyEditor extends HTMLElement {
  style = `
    .ContainerEditeur {
      display: flex;
      flex-direction: column;
      align-items: flex-start;      
      width: 100%; 
      height: 500px;
      overflow-x: auto;
      overflow-y: scroll;
      border: 1px solid #ccc;
      white-space: nowrap;
      border: 1px solid #d1d5db;
      background-color: white;

      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .ContainerEditeur::-webkit-scrollbar {
      width: 8px;
    }
    .ContainerEditeur::-webkit-scrollbar-thumb {
      background-color: #888;
      border-radius: 4px;
    }
    .ContainerEditeur::-webkit-scrollbar-thumb:hover {
      background-color: #555;
    }

    .MonEditeur {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 10px;
      display: inline-block;
      
    }

    canvas-piano {
      position: sticky;
      left: 0;
      z-index: 1;
    }

    #editeur {
      background-color: #f0f4f8; 
  }`;

  html = `
<script src="https://pixijs.download/release/pixi.js"></script>

<script type="module" src="./mycomponents/editor.js"></script>
<script type="module" src="./mycomponents/piano.js"></script>
<div id="editeur">
  

  <input type="range" id="sliderZoomHorizontal" min="0.34" max="3" step="0.01" value="1">
  <span id="scaleXValue">1</span>

  <input type="range" id="sliderZoomVertical" min="0.3" max="1" step="0.001" value="1">

  <span id="scaleYValue">1</span>

  <button id="play">Play</button> 

  <h1> WAM Editor </h1>
  
  <div class="ContainerEditeur">
    <div class="MonEditeur">
      <canvas-piano id="monClavier" ></canvas-piano>
      <canvas-editor id="grille"></canvas-editor> 
    </div>
  </div>

</div>`;

  constructor() {
    super();
    console.log('Component constructor called');
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

    this.editor = this.root.querySelector('#grille');
    this.piano = this.root.querySelector('#monClavier');
    this.addListeners();
  }

  addListeners() {
    // Add event listeners for the slider inputs and button
    this.root.querySelector('#sliderZoomHorizontal').addEventListener('input', (event) => {
      this.scaleXValue = event.target.value;
      this.root.querySelector('#scaleXValue').textContent = this.scaleXValue;
      this.editor.zoom(this.scaleXValue, this.scaleYValue);
      this.piano.zoom(this.scaleXValue, this.scaleYValue);
    });

    this.root.querySelector('#sliderZoomVertical').addEventListener('input', (event) => {
      this.scaleYValue = event.target.value;
      this.root.querySelector('#scaleYValue').textContent = this.scaleYValue;
      this.editor.zoom(this.scaleXValue, this.scaleYValue);
      this.piano.zoom(this.scaleXValue, this.scaleYValue);

    });

    // Acceleration of the cursor at each play
    this.root.querySelector('#play').addEventListener('click', () => {
      // Call the function to play or perform any action when the button is clicked
      this.isPlaying = !this.isPlaying; // Bascule entre Play et Pause

      // Change le texte du bouton en fonction de l'état
      this.root.querySelector('#play').textContent = this.isPlaying ? "⏸ Pause" : "▶ Play";
      //this.editor.playCurseur(this.isPlaying);


      //Attention le curseur accélère à chaque play
        //this.editor.playCurseur(this.isPlaying);
        this.editor.app.ticker.add(() => {
          if(!this.isPlaying) return; // Si pas en mode lecture, ne rien faire
          this.editor.curseur.x += 1;
          if (this.editor.curseur.x > this.editor.worldWidth) {
            this.editor.curseur.x = 300;
          }
        });
      

      //console.log("État du bouton Play:", this.isPlaying);
    });


  }

}

customElements.define('mon-editeur', MyEditor);