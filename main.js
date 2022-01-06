import './style.css'
import { fabric } from 'fabric'
import VerticalTextbox from './VerticalTextbox';
import Canvas from './Canvas';

const canvas = new Canvas('c');
const btnFlip = document.getElementById('ButtonFlip');
// const text = '熊玩\nヌ日池」極健リ\nabc\nhello))健 1234 名８食ー教策12ぜ'
const text = '(abc)こbra\ncket]日「ム」\n極ー右';

let style = {
  "fill": "#292929",
  "editable": true,
  "fontSize": 40,
  width: 300,
  "fontWeight": "normal",
  "underline": false,
  "backgroundColor": "transparent",
  "fontFamily": "gothic",
  "left": 100,
  "top": 50,
  lineHeight: 5,
  linethrough: false,
  overline: false,
};

// let funcName = 'calcTextWidth';
// let cls = 'IText';

// fabric[cls].prototype[funcName] = ((originfc) => {
//   return function () {
//     const result = originfc.apply(this, arguments);
//     console.log({ result }, this.width)
//     return result;
//   }
// })(fabric[cls].prototype[funcName])

const cjkText = new VerticalTextbox(text, style);
const textbox = new fabric.Textbox(text, Object.assign(style, {
  left: 500
}));

function handleTextFlipped(txtbox, originTxtBox) {
  const originIndex = canvas.getObjects().indexOf(originTxtBox);
  canvas.startEditing();
  canvas.insertAt(txtbox, originIndex, true);
  canvas.stopEditing();
  canvas.setActiveObject(txtbox);
}

btnFlip.onclick = () => {
  const activeObject = canvas.getActiveObject();
  console.log('[x] active-objects', activeObject);

  if (activeObject.type === 'vertical-textbox') {
    activeObject.toTextbox(txtbox => handleTextFlipped(txtbox, activeObject))
  } else if (activeObject.type === 'textbox') {
    VerticalTextbox.fromTextbox(activeObject, txtbox => handleTextFlipped(txtbox, activeObject))
  }
}

canvas.add(cjkText)
// canvas.add(textbox)

function updateStyles() {
  if (cjkText.isEditing) {
    cjkText.setSelectionStyles(style)
  }

  if (textbox.isEditing) {
    textbox.setSelectionStyles(style)
  }
}


window.addEventListener('keydown', (kbEvt) => {
  if (kbEvt.ctrlKey) {
    let isHandled = false;

    if (kbEvt.code === 'KeyZ') {
      if (kbEvt.shiftKey) {
        canvas.redo();
      } else {
        canvas.undo();
      }
    }
    // style.fontFamily = 'gothic'
    // style.fontSize = 50;
    // style.linethrough = true;
    // style.overline = true;
    if (kbEvt.code === 'KeyB') {
      style.fontWeight = style.fontWeight === 'bold' ? 'normal' : 'bold';
      updateStyles();
      isHandled = true;
    }

    if (kbEvt.code === 'Digit0') {
      style.textBackgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      updateStyles();
      isHandled = true;
    }

    if (kbEvt.code === 'KeyU') {
      style.underline = !style.underline;
      updateStyles();
      isHandled = true;
    }
    if (kbEvt.code === 'KeyG') {
      style.linethrough = !style.linethrough;
      updateStyles();
      isHandled = true;
    }
    if (kbEvt.code === 'KeyE') {
      style.overline = !style.overline;
      updateStyles();
      isHandled = true;
    }

    if (kbEvt.code === 'Equal') {
      style.fontSize += 2;
      updateStyles();
      isHandled = true;
    }
    if (kbEvt.code === 'Minus') {
      style.fontSize -= 2;
      updateStyles();
      isHandled = true;
    }
    if (isHandled) {
      kbEvt.preventDefault();
      kbEvt.stopPropagation();
    }
    canvas.requestRenderAll();
  }

})
