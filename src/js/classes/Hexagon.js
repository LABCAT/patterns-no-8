export default class Hexagon {
    constructor(p5, x, y, radius, startAngle, targetAngle, bgColor) {
        this.p             = p5;
        this.xPos          = x;
        this.yPos          = y;
        this.width         = Math.sqrt(3)/2 * radius;
        this.radius        = radius;
        this.currAngle     = startAngle || 0;
        this.targetAngle   = targetAngle || startAngle || 0;
        this.bgColor       = bgColor || '#fff';
        this.graphics      = this.p.createGraphics(radius*2, radius*2);
        this.drawHexagonShape(this.graphics, radius, bgColor);
    }

    drawHexagonTile(sideNumsOrder = this.sideNumsOrder) {
        //  Hexagon.drawHexagonTile(this.graphics, radius, this.hexagonMask, sideNumsOrder, this.linesWidth, this.colorPalette, this.bgColor, this.isShowShape);
    }

    drawHexagonShape = (ctx, radius, {strokeColor = 'black', strokeW = 1, isFilled = false, fillColor = 'black'} = {}) => {
        const diameter   = radius * 2;
        const sidesNum   = 6;
        const angleStep  = 360 / sidesNum;
        const centerXpos = diameter/2;
        const centerYpos = diameter/2;

        this.graphics.push();
        this.graphics.beginShape();

        if (isFilled) {
            this.graphics.fill(fillColor);
        } else {
            this.graphics.noFill();
        }

        this.graphics.stroke(strokeColor);
        this.graphics.strokeWeight(strokeW);

        for (let a = 0; a <= 360; a += angleStep) {
            let x = (radius + .5) * this.p.cos(this.p.radians(a)) + centerXpos;
            let y = (radius + .5) * this.p.sin(this.p.radians(a)) + centerYpos;
            this.graphics.vertex(x, y);
        }
        this.graphics.endShape();
        this.graphics.pop();
    };

    draw(x, y) {
        this.p.push();
        this.p.translate(x - this.radius, y - this.radius);
        this.p.rotate(this.currAngle);
        this.p.image(this.graphics, -this.radius, -this.radius);
        this.p.pop();

        // prevention of extra calculations for rotate
        if(this.currAngle !== this.targetAngle) {
            // rotate easing
            this.currAngle += (this.targetAngle - this.currAngle) * 0.12;

            if (Math.abs(this.currAngle - this.targetAngle) < .0001) {
                this.currAngle = this.targetAngle;
            }
        }
    }
}

// Hexagon.drawHexagonTile = (ctx, radius, maskForCtx, sideNumsOrder, linesWidth, colorPalette, bgColor = '#fff', isShowHexagonShape = false) => {
//   ctx.drawingContext.globalCompositeOperation = 'source-over';
//   const angleStep = TWO_PI / 6;

//   ctx.noFill();
//   ctx.strokeWeight(lineWidth);
//   ctx.background(bgColor);

//   for (let i = 0; i < sideNumsOrder.length; i += 2) {
//     let firstRndSideNum  = sideNumsOrder[i];
//     let secondRndSideNum = sideNumsOrder[i + 1];

//     if (firstRndSideNum > secondRndSideNum) {
//       // a swap of values so that the second side is after the first
//       // just to simplify future calculations
//       [firstRndSideNum, secondRndSideNum] = [secondRndSideNum, firstRndSideNum];
//     }

//     const startDrawPoint = Hexagon._getMiddlePointBetweenVertexes(secondRndSideNum, secondRndSideNum + 1, angleStep);
//     const endDrawPoint   = Hexagon._getMiddlePointBetweenVertexes(firstRndSideNum, firstRndSideNum + 1, angleStep);
//     const diff           = Math.abs(secondRndSideNum - firstRndSideNum);

//     switch (diff) {
//       // neighbor sides - arc or 1/3 of circle
//       case 5: secondRndSideNum = 6; // convert 0 pos to 6
//       case 1: {
//         for (let j = 0; j < linesWidth.length; j++) {
//           Hexagon.drawArc(ctx, radius, secondRndSideNum, angleStep, linesWidth[j], colorPalette[j]);
//         }
//         break;
//       }
//       // sides through one - curve or oval segment
//       case 4: [firstRndSideNum, secondRndSideNum] = [secondRndSideNum, firstRndSideNum];
//       case 2: {
//         for (let j = 0; j < linesWidth.length; j++) {
//           Hexagon.drawArch(ctx, radius, firstRndSideNum, angleStep, linesWidth[j], colorPalette[j]);
//         }
//         break;
//       }
//       // opposite - strait line
//       case 3: {
//         for (let j = 0; j < linesWidth.length; j++) {
//           Hexagon.drawLine(ctx, startDrawPoint, endDrawPoint, linesWidth[j], colorPalette[j]);
//         }
//         break;
//       }
//     }
//   }

//   if (isShowHexagonShape) {
//     Hexagon.drawHexagonShape(ctx, radius);
//   }

//   ctx.drawingContext.globalCompositeOperation ="destination-in";
//   ctx.image(maskForCtx, 0, 0);

//   return ctx;
// };