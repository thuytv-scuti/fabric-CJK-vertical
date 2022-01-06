import { fabric } from "fabric";
import VerticalTextbox from "./VerticalTextbox";

export default class Canvas extends fabric.Canvas {
  constructor(...args) {
    super(...args);
    fabric['VerticalTextbox'] = VerticalTextbox;
    this.isEditing = false;
  }

  onStartEditing() { }
  onStopEditing() { }

  startEditing() {
    this.isEditing = true;
    this.onStartEditing();
  }

  stopEditing() {
    this.isEditing = false;
    this.onStopEditing();
    this._historySaveAction();
  }

  initialize(...args) {
    super.initialize.apply(this, args);
    this._historyInit();
    return this;
  }

  dispose(...args) {
    super.dispose.apply(this, args);
    this._historyDispose();

    return this;
  }

  /**
   * Returns current state of the string of the canvas
   */
  _historyNext() {
    return JSON.stringify(this.toDatalessJSON(this.extraProps));
  }

  /**
   * Returns an object with fabricjs event mappings
   */
  _historyEvents() {
    return {
      'object:added': this._historySaveAction,
      'object:removed': this._historySaveAction,
      'object:modified': this._historySaveAction,
      'object:skewing': this._historySaveAction
    }
  }

  /**
   * Initialization of the plugin
   */
  _historyInit() {
    this.historyUndo = [];
    this.historyRedo = [];
    this.extraProps = ['selectable'];
    this.historyNextState = this._historyNext();

    this.on(this._historyEvents());
  }

  /**
   * Remove the custom event listeners
   */
  _historyDispose() {
    this.off(this._historyEvents())
  }

  /**
   * It pushes the state of the canvas into history stack
   */
  _historySaveAction() {

    if (this.historyProcessing || this.isEditing)
      return;

    const json = this.historyNextState;
    this.historyUndo.push(json);
    this.historyNextState = this._historyNext();
    this.fire('history:append', { json: json });
  }

  /**
   * Undo to latest history. 
   * Pop the latest state of the history. Re-render.
   * Also, pushes into redo history.
   */
  undo(callback) {
    // The undo process will render the new states of the objects
    // Therefore, object:added and object:modified events will triggered again
    // To ignore those events, we are setting a flag.
    this.historyProcessing = true;

    const history = this.historyUndo.pop();
    if (history) {
      // Push the current state to the redo history
      this.historyRedo.push(this._historyNext());
      this.historyNextState = history;
      this._loadHistory(history, 'history:undo', callback);
    } else {
      this.historyProcessing = false;
    }
  }

  /**
   * Redo to latest undo history.
   */
  redo(callback) {
    // The undo process will render the new states of the objects
    // Therefore, object:added and object:modified events will triggered again
    // To ignore those events, we are setting a flag.
    this.historyProcessing = true;
    const history = this.historyRedo.pop();
    if (history) {
      // Every redo action is actually a new action to the undo history
      this.historyUndo.push(this._historyNext());
      this.historyNextState = history;
      this._loadHistory(history, 'history:redo', callback);
    } else {
      this.historyProcessing = false;
    }
  }

  _loadHistory(history, event, callback) {
    var that = this;

    this.loadFromJSON(history, function () {
      that.renderAll();
      that.fire(event);
      that.historyProcessing = false;

      if (callback && typeof callback === 'function')
        callback();
    });
  }

  /**
   * Clear undo and redo history stacks
   */
  clearHistory() {
    this.historyUndo = [];
    this.historyRedo = [];
    this.fire('history:clear');
  }

  /**
   * Off the history
   */
  offHistory() {
    this.historyProcessing = true;
  }

  /**
   * On the history
   */
  onHistory() {
    this.historyProcessing = false;

    this._historySaveAction();
  }
}