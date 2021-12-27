import { fabric } from 'fabric'

const LATIN_CHARS_REGX = /[a-zA-Z\.\s]+/;
const NUMBERIC_REGX = /[0-9]/;
const BRACKETS_REGX = /[\(\)]/;
const JP_BRACKETS = /[ー「」『』（）〔〕［］｛｝｟｠〈〉《》【】〖〗〘〙〚〛゛゜。、・゠＝〜…•‥◦﹅﹆]/;
export default class CJKTextbox extends fabric.IText {
  textAlign = 'right';
  direction = 'rtl';
  typeObject = 'cjk-vertical'

  initDimensions() {
    this.textAlign = 'right';
    this.direction = 'rtl';
    return super.initDimensions.call(this)
  }

  _renderTextCommon(ctx, method) {
    ctx.save();
    var lineHeights = 0, left = this._getLeftOffset(), top = this._getTopOffset();
    for (var i = 0, len = this._textLines.length; i < len; i++) {
      if (!this.__charBounds[i]) {
        this.measureLine(i)
      }
      var heightOfLine = this.getHeightOfLine(i);
      this._renderTextLine(
        method,
        ctx,
        this._textLines[i],
        left - lineHeights,
        top,
        i
      );
      lineHeights += heightOfLine;
    }
    ctx.restore();
  }

  _renderCJKChars(method, ctx, lineIndex, charIndex, left, top) {
    let charbox = this.__charBounds[lineIndex][charIndex],
      char = this._textLines[lineIndex][charIndex],
      localLineHeight = this.getHeightOfLine(lineIndex),
      offsetLeft = charbox.height,
      offsetTop = charbox.width,
      leftDiff = localLineHeight / this.lineHeight - offsetLeft,
      charLeft = left - leftDiff + Math.max(0, leftDiff - offsetLeft),
      charTop = top + charbox.top + offsetTop,
      isLtr = this.direction === 'ltr';

    ctx.save();

    ctx.canvas.setAttribute('dir', isLtr ? 'ltr' : 'rtl');
    ctx.direction = isLtr ? 'ltr' : 'rtl';
    ctx.textAlign = isLtr ? 'left' : 'right';

    if (JP_BRACKETS.test(char)) {
      const tx = charLeft - charbox.width / 2,
        ty = charTop - charbox.height / 2 + 3; // somehow, the char is a bit higher after rotation;
      ctx.translate(tx, ty);
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-tx, -ty);
      // ctx.fillStyle = 'red';
      // ctx.fillRect(
      //   charLeft - charbox.width,
      //   charTop - charbox.height,
      //   charbox.width,
      //   charbox.height
      // )
    }

    this._renderChar(method,
      ctx,
      lineIndex,
      charIndex,
      char,
      charLeft,
      charTop,
      0
    );

    ctx.restore();
  }

  _renderAlphaNumberic(method, ctx, lineIndex, startIndex, endIndex, left, top) {
    let charsBox = { ...this.__charBounds[lineIndex][startIndex] },
      chars = '',
      localLineHeight = this.getHeightOfLine(lineIndex),
      offsetLeft = charsBox.height,
      offsetTop = this.lineHeight,
      leftDiff = localLineHeight / this.lineHeight - offsetLeft,
      charLeft = left - leftDiff + Math.max(0, leftDiff - offsetLeft),
      charTop = top + charsBox.top + offsetTop;

    for (let i = startIndex; i <= endIndex; i++) {
      chars += this._textLines[lineIndex][i];
      charsBox.width = charsBox.width + this.__charBounds[lineIndex][i].width;
      if (charsBox.height < this.__charBounds[lineIndex][i].height) {
        charsBox.height = this.__charBounds[lineIndex][i].height;
      }
    }

    ctx.save();
    const tx = charLeft,
      ty = charTop;
    ctx.translate(tx, ty);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-tx, -ty);
    this._renderChar(method,
      ctx,
      lineIndex,
      startIndex,
      chars,
      charLeft,
      charTop + charsBox.height - 3,
      0
    );
    ctx.restore();
  }

  _renderChars(method, ctx, line, left, top, lineIndex) {
    let timeToRender,
      startChar = null,
      endChar = null;
    ctx.save();
    for (var i = 0, len = line.length - 1; i <= len; i++) {
      if (!this._isLatin(line[i])) {
        this._renderCJKChars(method, ctx, lineIndex, i, left, top);
      } else {
        timeToRender = (i === len || !this._isLatin(line[i + 1]));
        if (startChar === null && this._isLatin(line[i])) {
          startChar = i;
        };
        if (timeToRender) {
          endChar = i;
          this._renderAlphaNumberic(method, ctx, lineIndex, startChar, endChar, left, top);
          timeToRender = false;
          startChar = null;
          endChar = null;
        }
      }
    }
    ctx.restore();
  }

  _willCharRotate(char) {
    return JP_BRACKETS.test(char) || this._isLatin(char);
  }

  _isLatin(char) {
    return LATIN_CHARS_REGX.test(char) || BRACKETS_REGX.test(char) || NUMBERIC_REGX.test(char);
  }

  calcTextWidth() {
    return super.calcTextHeight.call(this)
  }

  calcTextHeight() {
    let longestLine = 0,
      currentLineHeight = 0,
      char,
      space = 0;

    if (this.charSpacing !== 0) {
      space = this._getWidthOfCharSpacing();
    }
    for (var lineIndex = 0, len = this._textLines.length; lineIndex < len; lineIndex++) {
      if (!this.__charBounds[lineIndex]) {
        this._measureLine(lineIndex);
      }
      currentLineHeight = 0;
      for (let charIndex = 0, rlen = this._textLines[lineIndex].length; charIndex < rlen; charIndex++) {
        char = this._textLines[lineIndex][charIndex];
        if (char) {
          if (this._isLatin(char)) {
            currentLineHeight += this.__charBounds[lineIndex][charIndex].width + space;
          } else {
            currentLineHeight += this.__charBounds[lineIndex][charIndex].height + space;
          }
        }
      }
      if (currentLineHeight > longestLine) {
        longestLine = currentLineHeight;
      }
    }
    return longestLine;
  }

  getSelectionStartFromPointer(e) {
    var mouseOffset = this.getLocalPointer(e),
      prevHeight = 0,
      width = 0,
      height = 0,
      charIndex = 0,
      lineIndex = 0,
      charBox,
      lineHeight = 0,
      space = 0,
      line;

    if (this.charSpacing !== 0) {
      space = this._getWidthOfCharSpacing();
    }
    // handling of RTL: in order to get things work correctly,
    // we assume RTL writing is mirrored compared to LTR writing.
    // so in position detection we mirror the X offset, and when is time
    // of rendering it, we mirror it again.
    mouseOffset.x = this.width * this.scaleX - mouseOffset.x + width;
    for (var i = 0, len = this._textLines.length; i < len; i++) {
      if (width <= mouseOffset.x) {
        lineHeight = this.getHeightOfLine(i) * this.scaleY;
        width += lineHeight;
        lineIndex = i;
        if (i > 0) {
          charIndex += this._textLines[i - 1].length + this.missingNewlineOffset(i - 1);
        }
      }
      else {
        break;
      }
    }
    line = this._textLines[lineIndex];
    for (var j = 0, jlen = line.length; j < jlen; j++) {
      prevHeight = height;
      charBox = this.__charBounds[lineIndex][j];
      if (this._isLatin(this._textLines[lineIndex][j])) {
        height += charBox.width * this.scaleY + space;
      } else {
        height += charBox.height * this.scaleY + space;
      }
      if (height <= mouseOffset.y) {
        charIndex++;
      }
      else {
        break;
      }
    }
    return this._getNewSelectionStartFromOffset(mouseOffset, prevHeight, height, charIndex, jlen);
  }

  _getNewSelectionStartFromOffset(mouseOffset, prevHeight, height, index, jlen) {
    // we need Math.abs because when width is after the last char, the offset is given as 1, while is 0
    var distanceBtwLastCharAndCursor = mouseOffset.y - prevHeight,
      distanceBtwNextCharAndCursor = height - mouseOffset.y,
      offset = distanceBtwNextCharAndCursor > distanceBtwLastCharAndCursor ||
        distanceBtwNextCharAndCursor < 0 ? 0 : 1,
      newSelectionStart = index + offset;
    // if object is horizontally flipped, mirror cursor location from the end
    if (this.flipX) {
      newSelectionStart = jlen - newSelectionStart;
    }

    if (newSelectionStart > this._text.length) {
      newSelectionStart = this._text.length;
    }

    return newSelectionStart;
  }

  _getCursorBoundariesOffsets(position) {
    if (this.cursorOffsetCache && 'top' in this.cursorOffsetCache) {
      return this.cursorOffsetCache;
    }
    var lineLeftOffset,
      lineIndex,
      charIndex,
      topOffset = 0,
      leftOffset = 0,
      boundaries,
      charBox,
      cursorPosition = this.get2DCursorLocation(position);
    charIndex = cursorPosition.charIndex;
    lineIndex = cursorPosition.lineIndex;
    for (var i = 0; i < lineIndex; i++) {
      leftOffset += this.getHeightOfLine(i);
    }

    for (var i = 0; i < charIndex; i++) {
      charBox = this.__charBounds[lineIndex][i];
      if (this._isLatin(this._textLines[lineIndex][i])) {
        topOffset += charBox.width;
      } else {
        topOffset += charBox.height;
      }
    }

    lineLeftOffset = this._getLineLeftOffset(lineIndex);
    // bound && (leftOffset = bound.left);
    if (this.charSpacing !== 0 && charIndex === this._textLines[lineIndex].length) {
      leftOffset -= this._getWidthOfCharSpacing();
    }
    boundaries = {
      top: lineLeftOffset + (topOffset > 0 ? topOffset : 0),
      left: leftOffset + 3,
    };
    if (this.direction === 'rtl') {
      boundaries.left *= -1;
    }

    this.cursorOffsetCache = boundaries;
    return this.cursorOffsetCache;
  }

  _getGraphemeBox(grapheme, lineIndex, charIndex, prevGrapheme, skipLeft) {
    let box = super._getGraphemeBox(grapheme, lineIndex, charIndex, prevGrapheme, skipLeft);
    box.top = 0;

    if (charIndex > 0 && !skipLeft) {
      const previousBox = this.__charBounds[lineIndex][charIndex - 1];
      const isAlphaNumeric = this._isLatin(this._textLines[lineIndex][charIndex - 1]);
      box.top = previousBox.top + previousBox[isAlphaNumeric ? 'width' : 'height'];
    }

    return box;
  }

  /**
   * 
   * @param {*} boundaries 
   * @param {CanvasRenderingContext2D} ctx 
   */
  renderSelection(boundaries, ctx) {
    var selectionStart = this.inCompositionMode ? this.hiddenTextarea.selectionStart : this.selectionStart,
      selectionEnd = this.inCompositionMode ? this.hiddenTextarea.selectionEnd : this.selectionEnd,
      isJustify = this.textAlign.indexOf('justify') !== -1,
      start = this.get2DCursorLocation(selectionStart),
      end = this.get2DCursorLocation(selectionEnd),
      startLine = start.lineIndex,
      endLine = end.lineIndex,
      startChar = start.charIndex < 0 ? 0 : start.charIndex,
      endChar = end.charIndex < 0 ? 0 : end.charIndex;
    for (var i = startLine; i <= endLine; i++) {
      var lineHeight = this.getHeightOfLine(i),
        boxStart = 0, boxEnd = 0;

      if (i === startLine) {
        boxStart = this.__charBounds[startLine][startChar].top;
      }
      if (i >= startLine && i < endLine) {
        boxEnd = isJustify && !this.isEndOfWrapping(i) ? this.height : this.getLineWidth(i) || 5; // WTF is this 5?
      }
      else if (i === endLine) {
        if (endChar === 0) {
          boxEnd = this.__charBounds[endLine][endChar].top;
        }
        else {
          var charSpacing = this._getWidthOfCharSpacing();
          boxEnd = this.__charBounds[endLine][endChar - 1].top - charSpacing;
          if (this._isLatin(this._textLines[endLine][endChar])) {
            boxEnd += this.__charBounds[endLine][endChar].width;
          } else {
            boxEnd += this.__charBounds[endLine][endChar].height;
          }
        }
      }
      var drawStart = boundaries.left + lineHeight * i,
        drawWidth = lineHeight,
        drawHeight = boxEnd - boxStart;

      if (this.lineHeight < 1 || (i === endLine && this.lineHeight > 1)) {
        drawWidth /= this.lineHeight;
      }
      if (this.inCompositionMode) {
        ctx.fillStyle = this.compositionColor || 'black';
      }
      else {
        ctx.fillStyle = this.selectionColor;
      }
      if (this.direction === 'rtl') {
        drawStart = this.width - drawStart - drawWidth;
      }
      ctx.fillRect(
        drawStart,
        boundaries.top + boxStart,
        drawWidth,
        drawHeight,
      );
    }
  }


  renderCursor(boundaries, ctx) {
    var cursorLocation = this.get2DCursorLocation(),
      lineIndex = cursorLocation.lineIndex,
      charIndex = cursorLocation.charIndex > 0 ? cursorLocation.charIndex - 1 : 0,
      charHeight = this.getValueOfPropertyAt(lineIndex, charIndex, 'fontSize'),
      multiplier = this.scaleX * this.canvas.getZoom(),
      cursorWidth = this.cursorWidth / multiplier,
      topOffset = boundaries.topOffset,
      dy = this.getValueOfPropertyAt(lineIndex, charIndex, 'deltaY');
    topOffset += (1 - this._fontSizeFraction) * this.getHeightOfLine(lineIndex) / this.lineHeight
      - charHeight * (1 - this._fontSizeFraction);

    if (this.inCompositionMode) {
      this.renderSelection(boundaries, ctx);
    }
    ctx.fillStyle = this.cursorColor || this.getValueOfPropertyAt(lineIndex, charIndex, 'fill');
    ctx.globalAlpha = this.__isMousedown ? 1 : this._currentCursorOpacity;
    ctx.fillRect(
      boundaries.left + boundaries.leftOffset - charHeight,
      topOffset + boundaries.top + dy,
      charHeight,
      cursorWidth,
    );
  }
}