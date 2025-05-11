import { PIXI } from './libs/pixi.js';
import { EDITOR_CONFIG as CONFIG } from './config/editorConfig.js';

//Classe Note
class Note extends PIXI.Graphics {
    dragZone = new PIXI.Graphics();
    coteSelec = false;
    color = null;
    constructor(x, y, l, h) {

        super();

        this.color = "blue";
        this.rect(0, 1, l - 1, h - 1);
        this.fill(this.color);
        this.position.set(x, y);

        this.interactive = true;
        this.eventMode = 'static';

        this.cursor = 'pointer';

        this.creeDragZone(x, y, l, h);

        this.interactive = true;
    }

    //Zone Créée 
    creeDragZone(noteX, noteY, noteWidth, noteHeight, worldContainer) {
        this.dragZone.rect(noteWidth - 10, 0, 10, noteHeight + 1);
        this.dragZone.fill("red");// la rendre invisible
        this.dragZone.position.set(noteX, noteY);

        this.dragZone.x = noteX;
        this.dragZone.y = noteY;
        this.dragZone.interactive = true;
        this.dragZone.cursor = "ew-resize"; // Curseur de redimensionnement

    }
}


export default class Editor extends HTMLElement {
    // Propriétés privées
    app;
    worldContainer;
    curseur;
    dragTarget = null;
    lastClickTime = 0;
    gridSnapping = true;
    worldWidth;
    worldHeight;
    longueurTouchesBlanches;
    const1 = 0;
    const2 = 0;

    // Constantes de la grille
    cellSizeHAUTEUR = CONFIG.GRID.CELL_HEIGHT;
    cellSizeLARGEUR = CONFIG.GRID.CELL_WIDTH;
    signature = CONFIG.GRID.DEFAULT_SIGNATURE;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.initializeProperties();
        this.initializeApp();
    }

    initializeProperties() {
        // Initialisation de l'application PIXI
        this.app = new PIXI.Application();

        // Initialisation des conteneurs
        this.worldContainer = new PIXI.Container({ isRenderGroup: true });
        this.curseur = new PIXI.Graphics();

        // Initialisation des dimensions du monde
        this.xMax = CONFIG.WORLD.MAX_HORIZONTAL * 10;
        this.yMax = CONFIG.WORLD.MAX_VERTICAL * 10;

        // Initialisation des positions
        this.x = 0;
        this.y = 0;

        // Initialisation des dimensions de l'écran
        this.screenWidth = CONFIG.CANVAS.WIDTH;
        this.screenHeight = CONFIG.CANVAS.HEIGHT;
        console.log("screenWidth: " + this.screenWidth);
        console.log("screenHeight: " + this.screenHeight);

        // Initialisation des dimensions du monde
        this.worldWidth = (this.xMax / this.screenWidth) * CONFIG.WORLD.SIZE + this.screenWidth;
        this.worldHeight = 128 * this.cellSizeHAUTEUR;

        // Zone de hit pour les interactions
        this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
    }




    async initializeApp() {
        // Initialisation de PIXI
        await this.app.init({
            width: CONFIG.CANVAS.WIDTH,
            height: CONFIG.CANVAS.HEIGHT
        });

        this.shadowRoot.appendChild(this.app.canvas);
        this.app.stage.interactive = true;
        this.app.stage.eventMode = 'static';

        this.setupContainers();
        this.drawGrid();
        this.drawCurseur();
        this.setupEventListeners();


    }

    setupContainers() {
        this.worldContainer = new PIXI.Container({ isRenderGroup: true });

        this.app.stage.addChild(this.worldContainer);
    }

    setupEventListeners() {
        // Bind des méthodes
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.detecteDoubleClic = this.detecteDoubleClic.bind(this);

        // Configuration des événements
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointertap', this.detecteDoubleClic);
        this.app.stage.on('pointerup', this.onDragEnd);

    }

    // Méthodes de dessin
    drawGrid() {
        let grid = new PIXI.Graphics();
        grid.strokeStyle = "grey";

        for (let row = 0; row * this.cellSizeHAUTEUR <= this.worldHeight; row++) {
            grid.moveTo(0, row * this.cellSizeHAUTEUR);
            grid.lineTo(this.worldWidth, row * this.cellSizeHAUTEUR);
            grid.stroke({ color: "grey", pixelLine: true });
        }

        for (let col = 0; col * this.cellSizeLARGEUR <= (this.worldWidth + this.cellSizeLARGEUR); col++) {

            //modifie l'épaisseur de la ligne pour les mesures
            if (col % this.signature[0] == 1) {
                grid.stroke({ color: "white", pixelLine: true });
            }
            else {
                grid.stroke({ color: "grey", pixelLine: true });
            }
            grid.moveTo(col * this.cellSizeLARGEUR, 0);
            grid.lineTo(col * this.cellSizeLARGEUR, this.worldHeight);

        }

        grid.interactive = true;

        grid.position.set(0, 0);

        this.worldContainer.addChild(grid);
    }

    drawCurseur() {
        console.log("curseur");

        this.curseur.moveTo(2, 1);
        this.curseur.lineTo(2, this.worldHeight);
        this.curseur.stroke({ color: "red" });

        this.curseur.interactive = true;
        this.curseur.position.set(10, 0);

        this.worldContainer.addChild(this.curseur);
    }

    // Gestionnaires d'événements
    onDragStart(event) {
        this.dragTarget = event.currentTarget;
        this.dragTarget.alpha = 0.5;
        this.app.stage.on('pointermove', this.onDragMove);
    }

    onDragMove(event) {
        if (!this.dragTarget) return;
        this.dragTarget.parent.toLocal(event.global, null, this.dragTarget.position);
        this.dragTarget.dragZone.parent.toLocal(event.global, null, this.dragTarget.dragZone.position);

        if (this.gridSnapping) {
            this.dragTarget.x = Math.floor(this.dragTarget.x / this.cellSizeLARGEUR) * this.cellSizeLARGEUR;
            this.dragTarget.y = Math.floor(this.dragTarget.y / this.cellSizeHAUTEUR) * this.cellSizeHAUTEUR;

            this.dragTarget.dragZone.x = Math.floor(this.dragTarget.dragZone.x / this.cellSizeLARGEUR) * this.cellSizeLARGEUR;
            this.dragTarget.dragZone.y = Math.floor(this.dragTarget.dragZone.y / this.cellSizeHAUTEUR) * this.cellSizeHAUTEUR;
        }
        this.dragTarget.eventMode = 'static';
    }

    onDragEnd() {
        if (!this.dragTarget) return;
        this.app.stage.off('pointermove', this.onDragMove);
        this.dragTarget.alpha = 1;
        this.dragTarget = null;
    }


    detecteDoubleClic(event) {
        const currentTime = Date.now();
        let doubleClickInterval = 300; // Intervalle en millisecondes pour considérer un double-clic
        if (currentTime - this.lastClickTime < doubleClickInterval) {
            this.onDoubleClick(event); // Appelle la fonction associée au double-clic
        }

        this.lastClickTime = currentTime;
    }

    onDoubleClick(event) {
        //créer une note dans la cell du double clic
        let mousePos = event.global;


        mousePos.x /= this.worldContainer.scale.x;
        mousePos.y /= this.worldContainer.scale.y;


        if (this.gridSnapping) {

            mousePos.x = Math.floor((mousePos.x + this.const1) / this.cellSizeLARGEUR) * this.cellSizeLARGEUR;
            mousePos.y = Math.floor((mousePos.y + this.const2) / this.cellSizeHAUTEUR) * this.cellSizeHAUTEUR;

        }

        let note = new Note(mousePos.x, mousePos.y, this.cellSizeLARGEUR, this.cellSizeHAUTEUR);

        this.worldContainer.addChild(note.dragZone);
        this.worldContainer.addChild(note);

        note.eventMode = 'static';
        note.on('pointerdown', this.onDragStart.bind(this));

    }

// ATTENTION: UTILISATION DE CSS //
    // Méthodes publiques
    zoom(hauteur, largeur) {
        if (!this.app) return;
        // Mise à l'échelle directe du canvas view
        this.app.canvas.style.transform = `scale(${largeur}, ${hauteur})`;
        this.app.canvas.style.transformOrigin = '0 0'; // Point d'origine de la transformation

    }

    playCurseur(isPlaying) {
        if (!this.curseur) return;
        this.app.ticker.add(() => {
            this.curseur.x += 1;
            if (this.curseur.x > this.worldWidth) {
                this.curseur.x = 300;
            }

        });
    }

}

customElements.define('canvas-editor', Editor);