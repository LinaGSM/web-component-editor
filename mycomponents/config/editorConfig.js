export const EDITOR_CONFIG = {
    GRID: {
        CELL_HEIGHT: 25,
        CELL_WIDTH: 25,
        DEFAULT_SIGNATURE: [3, 4],
        ROWS: 128
    },
    WORLD: {
        SIZE: 100000,
        MAX_HORIZONTAL: 100,
        MAX_VERTICAL: 100
    },
    CANVAS: {
        WIDTH: 10000, 
        get HEIGHT() {
            return EDITOR_CONFIG.GRID.ROWS * EDITOR_CONFIG.GRID.CELL_HEIGHT;
        },/*
        HEIGHT: 3600*/

    },
    PIANO: {
        WIDTH: 50,
        get HEIGHT() {
            return EDITOR_CONFIG.CANVAS.HEIGHT;
        }/*
        HEIGHT: 360*/
    }
};