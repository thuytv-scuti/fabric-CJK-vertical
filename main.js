import './style.css'
import { fabric } from 'fabric'
import VerticalTextbox from './VerticalTextbox';

const canvas = new fabric.Canvas('c');
// const text = '熊玩\nヌ日池」極健リ\nabc\nhello))健 1234 名８食ー教策12ぜ'
const text = '(abc)こbracket]日「ム」極ー右';

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
  lineHeight: 3,
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

canvas.add(cjkText)
canvas.add(textbox)

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
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    // style.fontFamily = 'gothic'
    // style.fontSize = 50;
    // style.linethrough = true;
    // style.overline = true;
    // style.textBackgroundColor = '#' + randomColor;
    if (kbEvt.code === 'KeyB') {
      style.fontWeight = style.fontWeight === 'bold' ? 'normal' : 'bold';
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