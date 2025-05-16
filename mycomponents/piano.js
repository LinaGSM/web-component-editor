import { PIXI } from './libs/pixi.js';
import { EDITOR_CONFIG as CONFIG } from './config/editorConfig.js';

function getStyle() {
    return new PIXI.TextStyle({
        fontSize: 24,
        fill: 'red',
        wordWrap: true,
        wordWrapWidth: 200 // Limite la largeur du texte
    });
}


export default class Piano extends HTMLElement {

    pianoContainer;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        
        this.initializeProperties();
        this.initializeApp();
    }

    initializeProperties() {

        this.cellSizeHAUTEUR = CONFIG.GRID.CELL_HEIGHT;

        // Initialisation de l'application PIXI
        this.app = new PIXI.Application();
    
        // Initialisation du conteneurs de clavier
        
        // Initialisation des positions
        this.x = 0;
        this.y = 0;
    
        // Initialisation des dimensions de l'écran
        this.screenWidth = CONFIG.CANVAS.WIDTH;
        this.screenHeight = CONFIG.CANVAS.HEIGHT;
        
        // Initialisation des dimensions du monde
        this.worldWidth = (this.xMax / this.screenWidth) * CONFIG.WORLD.SIZE + this.screenWidth;
        this.worldHeight = 128 * this.cellSizeHAUTEUR;
    
        // Zone de hit pour les interactions
        this.hitArea = new PIXI.Rectangle(0, 0, this.worldWidth, this.worldHeight);
    }

    async initializeApp() {
        // Initialisation de PIXI
        await this.app.init({ 
            width: CONFIG.PIANO.WIDTH, 
            height: CONFIG.PIANO.HEIGHT 
        });

        this.shadowRoot.appendChild(this.app.canvas);
        this.app.stage.interactive = true;
        this.app.stage.eventMode = 'static';

        this.setupContainer();
        this.drawPiano();
        

    }

    //dans setupContainer
    setupContainer() {
        this.pianoContainer = new PIXI.Container();
        this.app.stage.addChild(this.pianoContainer);
    }

    drawPiano() {
        let clavier = new PIXI.Graphics();
        let touchesNoires = new PIXI.Graphics();
        let k = 2;

        //entre2TouchesNoires est la hauteur d'une touche blanche située entre deux touches noires
        let entre2TouchesNoires = 2 * this.cellSizeHAUTEUR;

        this.longueurTouchesBlanches = 50;

        let nombreOctaves = 8;

        //positionToucheBlancheSuivante est la position de la prochaine touche blanche à dessiner
        let positionToucheBlancheSuivante = 0;
        
        //75 est le nombre de touches blanches à dessiner
        //les touches noires sont dessinées en même temps
        for (let i = 0; i < 75; i++) {
            //ici on dessine les touches blanches qui sont entre deux touches noires 
            if (k == 1 || k == 2 || k == 5) {
                clavier.rect(0, positionToucheBlancheSuivante, this.longueurTouchesBlanches, entre2TouchesNoires);
                positionToucheBlancheSuivante += entre2TouchesNoires;

            }
            //et ici on dessine les autres touches blanches 
            else {
                clavier.rect(0, positionToucheBlancheSuivante, this.longueurTouchesBlanches, (3 / 2) * this.cellSizeHAUTEUR);
                positionToucheBlancheSuivante += (3 / 2) * this.cellSizeHAUTEUR;
                
            }


            if (k == 4) {
                    
                    // Créer le texte correctement
                    let text = new PIXI.Text({ text: "C" + nombreOctaves, getStyle });
                    text.x = (clavier.width - text.width) / 2;
                    text.y = positionToucheBlancheSuivante + (clavier.height - text.height) / 2 + this.cellSizeHAUTEUR ;

                    nombreOctaves--;

                    // Ajouter le texte au pianoContainer
                    this.pianoContainer.addChild(text);
                    this.app.stage.addChild(this.pianoContainer);

                }

            clavier.fill("white");
            clavier.stroke({ width: 2, color: 0x000000, alpha: 1 });

            //on dessine les touches noires
            if (k != 3 && k != 6) {
                touchesNoires.rect(0, positionToucheBlancheSuivante - (this.cellSizeHAUTEUR / 2), (2 / 3) * this.longueurTouchesBlanches, this.cellSizeHAUTEUR);
                touchesNoires.fill("black");
            }
            k++;
            if (k == 7) {
                k = 0;
            }

        }
        clavier.interactive = true;
        touchesNoires.interactive = true;

        this.pianoContainer.addChild(clavier);
        this.pianoContainer.addChild(touchesNoires);
        this.pianoContainer.addChildAt(clavier, 0);
    }

    //dans zoom (hauteur, largeur)

    // ATTENTION: UTILISATION DE CSS //
    // Méthodes publiques
    zoom(hauteur, largeur) {
        if (!this.app) return;
        // Mise à l'échelle directe du canvas view
         this.app.canvas.style.transform = `scale(1, ${hauteur})`;
        this.app.canvas.style.transformOrigin = '0 0'; // Point d'origine de la transformation
    }

}

customElements.define('canvas-piano', Piano);