import './style.css'
import { fabric } from 'fabric'
import CJKTextbox from './CJKTextbox';

const canvas = new fabric.Canvas('c');
const text = '熊玩\nロル\n「ヌ日池」\極健リ名8食フっー教策ぜ'

canvas.add(new CJKTextbox(text, { left: 50, top: 50, fontSize: 20, lineHeight: 2, direction: 'rtl' }))
canvas.add(new fabric.Textbox(text, { left: 500, top: 50, fontSize: 20, lineHeight: 3 }))