import './style.css'
import { fabric } from 'fabric'
import VerticalTextbox from './VerticalTextbox';

const canvas = new fabric.Canvas('c');
const text = '熊玩\nヌ日池」極健リ\nabc\nhello))健 1234 名８食ー教策12ぜ'

let style = {
  "fill": "#292929",
  "editable": true,
  "fontSize": 40,
  "fontWeight": "normal",
  "underline": false,
  "backgroundColor": "transparent",
  "fontFamily": "gothic",
  "left": 50,
  "top": 50
};

let funcName = 'setSelectionStyles';

// fabric.IText.prototype[funcName] = ((originfc) => {
//   return function () {
//     let [styles, startIndex, endIndex] = arguments;
//     const result = originfc.apply(this, arguments);
//     console.log('[x] start - end', this.selectionStart, this.selectionEnd)
//     console.log({ styles, startIndex, endIndex })
//     return result;
//   }
// })(fabric.IText.prototype[funcName])

const cjkText = new VerticalTextbox(text, style);
const textbox = new fabric.Textbox(text, Object.assign(style, {
  left: 500
}));

canvas.add(cjkText)
canvas.add(textbox)

window.addEventListener('keydown', (kbEvt) => {
  if (kbEvt.ctrlKey && kbEvt.code === 'KeyB') {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    style.underline = !style.underline;
    style.fontFamily = 'gothic'
    style.fontWeight = 'bold';
    style.fontSize = 30;
    // style.linethrough = true;
    // style.overline = true;
    // style.textBackgroundColor = '#' + randomColor;
    if (cjkText.isEditing) {
      console.log(style)
      cjkText.setSelectionStyles(style)
    }

    if (textbox.isEditing) {
      textbox.setSelectionStyles(style)
    }

    canvas.requestRenderAll();
  }
})