import { PIXI } from './libs/pixi.js';

let longueurTouchesBlanches;

function getStyle() {
    return new PIXI.TextStyle({
        fontSize: 24,
        fill: 'red',
        wordWrap: true,
        wordWrapWidth: 200 // Limite la largeur du texte
    });
}


//Classe Note
class Note extends PIXI.Graphics {
    dragZone = new PIXI.Graphics();
    coteSelec = false;
    color = null;
    constructor(x, y, l, h, screen, hitArea) {

        super();
        this.color = "blue";
        this.rect(0, 1, l - 1, h - 1);
        this.fill(this.color);
        this.position.set(x, y);

        this.interactive = true;
        this.eventMode = 'static';
        this.hitArea = this.hitArea;

        this.cursor = 'pointer';

        this.creeDragZone(x, y, l, h);

        this.interactive = true;
        //maRegion.push(this);

        //worldContainer.addChild(this);
        //worldContainer.addChild(this.dragZone);
        //this.on('pointerdown', this.onDragStart);
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


///////////////////////////////////////////
// Fonctions pour la création d'une note //
///////////////////////////////////////////




// Classe editor (WebComponent)
export default class Editor extends HTMLElement {

    

    app = new PIXI.Application();
    worldContainer = new PIXI.Container({
        isRenderGroup: true,
    });

    cellSizeHAUTEUR = 25;
    cellSizeLARGEUR = 25;

    gridSnapping = true;
    dragTarget = null;

    signature = [3, 4];

    curseur = new PIXI.Graphics();

    worldSize = 100000;

    const1 = 0;
    const2 = 0;

    maxHorizontal = 100;
    maxVertical = 100;

    // Variables pour la détection du double-clic
    lastClickTime = 0; // Temps du dernier clic
    //doubleClickInterval = 300; // Intervalle en millisecondes pour considérer un double-clic


    pianoContainer = new PIXI.Container({
        isRenderGroup: true,
    });

    constructor() {
        super();

        console.log("Editor constructor");


        this.attachShadow({ mode: 'open' });
        this.initializeApp();

        this.xMax = this.maxHorizontal * 10;
        this.yMax = this.maxVertical * 10;

        this.x = 0;
        this.y = 0;
        this.test = 0;

    }

    async initializeApp() {
        await this.app.init({ width: 650, height: 360 });

        this.screenWidth = this.app.renderer.width;
        this.screenHeight = this.app.renderer.height;
        this.worldWidth = (this.xMax / this.screenWidth) * this.worldSize + this.screenWidth;
        this.worldHeight = 128 * this.cellSizeHAUTEUR;

        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.pianoContainer);

        this.hitArea = new PIXI.Rectangle(0, 0, /*this.app.screen.width*/ this.worldWidth, /*this.app.screen.height*/ this.worldHeight);


        this.app.stage.interactive = true;
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.hitArea;

        

        this.worldContainer.interactive = true;
        this.worldContainer.eventMode = 'static';
        this.worldContainer.hitArea = this.hitArea;

        this.app.stage.on('pointertap', this.detecteDoubleClic.bind(this));

        this.app.stage.on('pointerup', this.onDragEnd.bind(this));

        this.shadowRoot.appendChild(this.app.canvas);

        this.app.ticker.add(() => {

            const targetX = (this.x / this.screenWidth) * this.worldSize;
            const targetY = (this.y / this.screenHeight) * this.worldSize;

            this.const1 = targetX;
            this.const2 = targetY;

            this.worldContainer.x += (-targetX - this.worldContainer.x);
            this.worldContainer.y += (-targetY - this.worldContainer.y);

            this.pianoContainer.y += (-targetY - this.pianoContainer.y);
        });

        this.note = new Note(100, 100, this.cellSizeLARGEUR, this.cellSizeHAUTEUR, this.app.screen, this.worldContainer);
        this.note.interactive = true;

        this.drawPiano();
        this.drawGrid();
        this.drawCurseur();

    }


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
            if (col % this.signature[0] == 0) {
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

    //Fonction pour dessiner un piano
    drawPiano() {
        let piano = new PIXI.Graphics();
        let touchesNoires = new PIXI.Graphics();
        let k = 0;

        //entre2TouchesNoires est la hauteur d'une touche blanche située entre deux touches noires
        let entre2TouchesNoires = 2 * this.cellSizeHAUTEUR;

        longueurTouchesBlanches = 50;

        let nombreOctaves = 0;

        //positionToucheBlancheSuivante est la position de la prochaine touche blanche à dessiner
        let positionToucheBlancheSuivante = 0;
        for (let i = 0; i < 70; i++) {
            //ici on dessine les touches blanches qui sont entre deux touches noires 
            if (k == 1 || k == 2 || k == 5) {
                if (k == 1) {
                    nombreOctaves++;
                    //console.log(" nombre d'octaves: " + nombreOctaves);

                    // Créer le texte correctement
                    let text = new PIXI.Text({ text: "C" + nombreOctaves, getStyle });
                    text.x = (piano.width - text.width) / 2;
                    text.y = positionToucheBlancheSuivante + (piano.height - text.height) / 2 + this.cellSizeHAUTEUR / 4;

                    //console.log("text.text: " + text.text);

                    // Ajouter le texte au pianoContainer
                    this.pianoContainer.addChild(text);
                    this.app.stage.addChild(this.pianoContainer);

                }
                piano.rect(0, positionToucheBlancheSuivante, longueurTouchesBlanches, entre2TouchesNoires);
                positionToucheBlancheSuivante += entre2TouchesNoires;

            }
            //et ici on dessine les autres touches blanches 
            else {
                piano.rect(0, positionToucheBlancheSuivante, longueurTouchesBlanches, (3 / 2) * this.cellSizeHAUTEUR);
                positionToucheBlancheSuivante += (3 / 2) * this.cellSizeHAUTEUR;
            }
            piano.fill("white");
            piano.stroke({ width: 2, color: 0x000000, alpha: 1 });

            //on dessine les touches noires
            if (k != 3 && k != 6) {
                touchesNoires.rect(0, positionToucheBlancheSuivante - (this.cellSizeHAUTEUR / 2), (2 / 3) * longueurTouchesBlanches, this.cellSizeHAUTEUR);
                touchesNoires.fill("black");
            }
            k++;
            if (k == 7) {
                k = 0;
            }

        }
        piano.interactive = true;
        touchesNoires.interactive = true;

        this.pianoContainer.addChild(piano);
        this.pianoContainer.addChild(touchesNoires);
        this.pianoContainer.addChildAt(piano, 0);
    }

    //Element Curseur
    drawCurseur() {
        this.curseur.moveTo(longueurTouchesBlanches + 2, 1);
        this.curseur.lineTo(longueurTouchesBlanches + 2, this.worldHeight);
        this.curseur.stroke({ color: "red" });

        this.curseur.interactive = true;
        this.curseur.position.set(0, 0);

        this.worldContainer.addChild(this.curseur);
    }



    //méthode pour zoomer sur la grille
    zoom(hauteur, largeur) {
        this.worldContainer.scale.set(hauteur, largeur);
        this.pianoContainer.scale.set(1, largeur);
    }

    scroll(x, y) {
        this.y = y * 10;
        this.x = x * 10;
    }

    playCurseur() {
        this.app.ticker.add(() => {
            this.curseur.x += 1;
            if (this.curseur.x > this.worldWidth) {
                this.curseur.x = 300;
            }

        });
    }
    stop() {
        this.app.ticker.stop();
    }


    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%//
    //%%% Fonctions pour les évènements %%//
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%//

    ///////////////////////////////////
    //Fonctions pour déplacer la note//
    ///////////////////////////////////


    onDragStart(event) {
        console.log("onDragStart");
        // Est appelé à cette ligne là: note.on('pointerdown', onDragStart); dans onDoubleClick 
        // lors de la création de la note
        //this.alpha = 0.5;
        //this.dragTarget = this;
        event.currentTarget.alpha = 0.5;
        this.dragTarget = event.currentTarget;
        console.log(" Detecte Evenement ");
        this.app.stage.on('pointermove', this.onDragMove.bind(this));
    }

    onDragMove(event) {
        if (this.dragTarget) {
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
    }

    onDragEnd(event) {
        if (this.dragTarget) {
            this.app.stage.off('pointermove', this.onDragMove);
            this.dragTarget.alpha = 1;
            this.dragTarget = null;
        }
    }


    // Variables pour la détection du double-clic
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

        let note = new Note(mousePos.x, mousePos.y, this.cellSizeLARGEUR, this.cellSizeHAUTEUR, this.hitArea);
        
        this.worldContainer.addChild(note.dragZone);
        this.worldContainer.addChild(note);

        note.eventMode = 'static';
        note.on('pointerdown', this.onDragStart.bind(this));
        //elementsDeEditor.push(note);

    }


}

customElements.define('canvas-editor', Editor);