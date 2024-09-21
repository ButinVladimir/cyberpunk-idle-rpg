import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { CityMapDistrictSelectEvent } from './events';
import { CityMapController } from './controller';

@customElement('ca-city-map-canvas')
export class CityMapCanvas extends LitElement {
  static styles = css`
    canvas {
      cursor: pointer;
    }
  `;

  private _cityMapController: CityMapController;

  private _canvasRef = createRef<HTMLCanvasElement>();

  @property({
    attribute: 'map-cell-zoom',
    type: Number,
  })
  mapCellZoom!: number;

  @property({
    attribute: 'selected-district',
    type: Number,
  })
  selectedDistrict?: number;

  constructor() {
    super();

    this._cityMapController = new CityMapController(this);
  }

  render() {
    const cellSizeWithBorder = this.cellSizeWithBorder;
    const width = this._cityMapController.mapWidth * cellSizeWithBorder;
    const height = this._cityMapController.mapHeight * cellSizeWithBorder;

    return html`
      <canvas
        ${ref(this._canvasRef)}
        width=${width}
        height=${height}
        @mouseleave=${this.handleMouseLeave}
        @mousemove=${this.handleMouseMove}
      >
        Canvas is not supported
      </canvas>
    `;
  }

  get cellSizeWithBorder() {
    return this.mapCellZoom + 1;
  }

  get map(): number[][] {
    return this._cityMapController.map;
  }

  protected firstUpdated(): void {
    this.renderCanvas();
  }

  protected updated(): void {
    this.renderCanvas();
  }

  private renderCanvas() {
    if (!this._canvasRef.value) {
      return;
    }

    const context = this._canvasRef.value.getContext('2d');
    if (!context) {
      throw new Error('Canvas context is not supported');
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = this._canvasRef.value.width;
    offscreenCanvas.height = this._canvasRef.value.height;
    const offscreenCanvasContext = offscreenCanvas.getContext('2d');
    if (!offscreenCanvasContext) {
      throw new Error('Canvas context is not supported');
    }

    this.renderCells(offscreenCanvasContext);
    this.renderBorders(offscreenCanvasContext);

    context.drawImage(offscreenCanvas, 0, 0);
  }

  private renderCells(context: CanvasRenderingContext2D) {
    const cellSizeWithBorder = this.cellSizeWithBorder;

    for (let x = 0; x < this._cityMapController.mapWidth; x++) {
      for (let y = 0; y < this._cityMapController.mapHeight; y++) {
        context.fillStyle = this.selectedDistrict === this.map[x][y] ? '#050' : '#010';
        context.fillRect(
          x * cellSizeWithBorder,
          y * cellSizeWithBorder,
          (x + 1) * cellSizeWithBorder,
          (y + 1) * cellSizeWithBorder,
        );
      }
    }
  }

  private renderBorders(context: CanvasRenderingContext2D) {
    const cellSizeWithBorder = this.cellSizeWithBorder;

    context.lineWidth = 1;
    context.strokeStyle = '#EEEEEE';

    for (let x = 0; x < this._cityMapController.mapWidth; x++) {
      for (let y = 0; y < this._cityMapController.mapHeight; y++) {
        if (x < this._cityMapController.mapWidth - 1 && this.map[x][y] !== this.map[x + 1][y]) {
          this.updateContextBorderStyle(
            context,
            this.map[x][y] === this.selectedDistrict || this.map[x + 1][y] === this.selectedDistrict,
          );

          context.beginPath();
          context.moveTo((x + 1) * cellSizeWithBorder, y * cellSizeWithBorder);
          context.lineTo((x + 1) * cellSizeWithBorder, (y + 1) * cellSizeWithBorder);
          context.stroke();
        }

        if (y < this._cityMapController.mapHeight - 1 && this.map[x][y] !== this.map[x][y + 1]) {
          this.updateContextBorderStyle(
            context,
            this.map[x][y] === this.selectedDistrict || this.map[x][y + 1] === this.selectedDistrict,
          );

          context.beginPath();
          context.moveTo(x * cellSizeWithBorder, (y + 1) * cellSizeWithBorder);
          context.lineTo((x + 1) * cellSizeWithBorder, (y + 1) * cellSizeWithBorder);
          context.stroke();
        }
      }
    }

    for (let x = 0; x < this._cityMapController.mapWidth; x++) {
      this.updateContextBorderStyle(context, this.map[x][0] === this.selectedDistrict);

      context.beginPath();
      context.moveTo(x * cellSizeWithBorder, 0);
      context.lineTo((x + 1) * cellSizeWithBorder, 0);
      context.stroke();
    }

    for (let y = 0; y < this._cityMapController.mapHeight; y++) {
      this.updateContextBorderStyle(context, this.map[0][y] === this.selectedDistrict);

      context.beginPath();
      context.moveTo(0, y * cellSizeWithBorder);
      context.lineTo(0, (y + 1) * cellSizeWithBorder);
      context.stroke();
    }

    for (let x = 0; x < this._cityMapController.mapWidth; x++) {
      this.updateContextBorderStyle(
        context,
        this.map[x][this._cityMapController.mapHeight - 1] === this.selectedDistrict,
      );

      context.beginPath();
      context.moveTo(x * cellSizeWithBorder, this._cityMapController.mapHeight * cellSizeWithBorder);
      context.lineTo((x + 1) * cellSizeWithBorder, this._cityMapController.mapHeight * cellSizeWithBorder);
      context.stroke();
    }

    for (let y = 0; y < this._cityMapController.mapHeight; y++) {
      this.updateContextBorderStyle(
        context,
        this.map[this._cityMapController.mapWidth - 1][y] === this.selectedDistrict,
      );

      context.beginPath();
      context.moveTo(this._cityMapController.mapWidth * cellSizeWithBorder, y * cellSizeWithBorder);
      context.lineTo(this._cityMapController.mapWidth * cellSizeWithBorder, (y + 1) * cellSizeWithBorder);
      context.stroke();
    }
  }

  private updateContextBorderStyle(context: CanvasRenderingContext2D, isSelected: boolean) {
    if (isSelected) {
      context.lineWidth = 2;
    } else {
      context.lineWidth = 1;
    }
  }

  private handleMouseLeave = () => {
    this.dispatchEvent(new CityMapDistrictSelectEvent(undefined));
  };

  private handleMouseMove = (event: MouseEvent) => {
    const cellSizeWithBorder = this.cellSizeWithBorder;
    const x = Math.min(Math.floor(event.offsetX / cellSizeWithBorder), this._cityMapController.mapWidth - 1);
    const y = Math.min(Math.floor(event.offsetY / cellSizeWithBorder), this._cityMapController.mapHeight - 1);

    this.dispatchEvent(new CityMapDistrictSelectEvent(this.map[x][y]));
  };
}
