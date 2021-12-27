import './style.css'
import { fabric } from 'fabric'
import CJKTextbox from './CJKTextbox';

const canvas = new fabric.Canvas('c');
const text = '熊玩\nヌ日池」極健リ\nabc\nhello))健 1234 名８食ー教策12ぜ'

canvas.add(new CJKTextbox(text, { left: 200, top: 50, fontSize: 20, direction: 'rtl' }))
canvas.add(new fabric.Textbox(text, { left: 500, top: 50, fontSize: 20, lineHeight: 3 }))
