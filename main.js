import './style.css'
import { fabric } from 'fabric'
import CJKTextbox from './CJKTextbox';

const canvas = new fabric.Canvas('c');
const text = '熊玩\nヌ日池」極健リ\nabc\nhello))健 1234 名８食ー教策12ぜ'
const cjkText = new CJKTextbox(text, { left: 200, top: 50, fontSize: 40, fill: 'pink' });
const textbox = new fabric.Textbox(text, { left: 500, top: 50, fontSize: 20, lineHeight: 3, stroke: 'blue' });

canvas.add(cjkText)
canvas.add(textbox)

window.addEventListener('keydown', (kbEvt) => {
  if (kbEvt.ctrlKey && kbEvt.code === 'KeyB') {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    let style = {};
    style.underline = true;
    // style.fontWeight = 'bold';
    // style.linethrough = true;
    // style.overline = true;
    // style.textBackgroundColor = '#' + randomColor;
    cjkText.setSelectionStyles(style)
    textbox.setSelectionStyles(style)

    canvas.requestRenderAll();
  }
})