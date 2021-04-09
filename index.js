const Canvas = require('canvas');

module.exports.create = async (template, values, consumer) => {
    if (typeof template != 'object') throw 'Template must be of type \'object\'';
    if (typeof values != 'object') throw 'Values must be of type \'object\'';

    if (typeof template.width != 'number') throw 'Width must be of type \'number\'';
    if (typeof template.height != 'number') throw 'Width must be of type \'number\'';

    if (template.width <= 0) throw 'Width must be more than 0';
    if (template.height <= 0) throw 'Height must be more than 0';

    let canvas = Canvas.createCanvas(template.width, template.height);
    let ctx = canvas.getContext('2d');

    if (typeof template.fonts == 'object') {
        for (let font in template.fonts) {
            let path = template.fonts[font];

            if (typeof path == 'string') {
                Canvas.registerFont(this.replace(path, values), {
                    'family': font
                });
            }
        }
    }

    if (Array.isArray(template.panels)) {
        ctx.save();

        for (let panel of template.panels) {
            let x = panel.x || 0;
            let y = panel.y || 0;

            let width = panel.width || 0;
            let height = panel.height || 0;

            if (typeof panel.color == 'string') {
                let color = this.replace(panel.color, values);

                if (width > 0 && height > 0 && /^#([0-9a-fA-F]{3}){1,2}$/.test(color)) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, width, height);
                }
            }

            if (typeof panel.url == 'string') {
                let url = this.replace(panel.url, values);

                if (url != '?') {
                    let i = await Canvas.loadImage(url);

                    if (width == 0 && height == 0) {
                        width = i.width;
                        height = i.height;
                    }

                    if (panel.centered) {
                        x -= width / 2;
                        y -= height / 2;
                    }

                    ctx.drawImage(i, x, y, width, height);
                }
            }
        }

        ctx.restore();
    }

    if (Array.isArray(template.text)) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';

        let size = 10;
        let family = 'sans-serif';
        let changed = true;

        for (let text of template.text) {
            if (Number.isInteger(text.size)) {
                size = text.size;
                changed = true;
            }

            if (typeof text.family == 'string') {
                family = text.family;
                changed = true;
            }

            if (changed) {
                ctx.font = size + 'px ' + family;
                changed = false;
            }

            if (typeof text.color == 'string') {
                let color = this.replace(text.color, values);

                if (/^#([0-9a-fA-F]{3}){1,2}$/.test(color)) {
                    ctx.fillStyle = color;
                }
            }

            if (typeof text.align == 'string') {
                ctx.textAlign = text.align;
            }

            if (typeof text.baseline == 'string') {
                ctx.textBaseline = text.baseline;
            }

            if (typeof text.value != 'string') continue;
            if (typeof text.x != 'number') continue;
            if (typeof text.y != 'number') continue;

            ctx.fillText(
                this.replace(text.value, values),
                text.x,
                text.y
            );
        }

        ctx.restore();
    }

    if (Array.isArray(template.circles)) {
        ctx.save();
        ctx.lineCap = 'butt';

        for (let circle of template.circles) {
            if (typeof circle.x != 'number') continue;
            if (typeof circle.y != 'number') continue;
            if (typeof circle.width != 'number') continue;
            if (typeof circle.radius != 'number') continue;

            if (Array.isArray(circle.sections)) {
                ctx.lineWidth = circle.width;

                let total = 0;
                let sections = [];

                for (let section of circle.sections) {
                    let weight = section.weight;

                    if (typeof weight == 'string') {
                        weight = parseInt(this.replace(section.weight, values));

                        if (isNaN(weight)) {
                            continue;
                        }
                    }

                    if (typeof weight != 'number' || weight <= 0) continue;
                    if (typeof section.color != 'string') continue;

                    let color = this.replace(section.color, values);

                    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(color)) {
                        total += weight;
                        sections.push({
                            "color": color,
                            "weight": weight
                        });
                    }
                }

                if (total == 0) {
                    ctx.strokeStyle = "#000";

                    if (typeof circle.default == 'string') {
                        let color = this.replace(circle.default, values);

                        if (/^#([0-9a-fA-F]{3}){1,2}$/.test(color)) {
                            ctx.strokeStyle = color;
                        }
                    }

                    ctx.beginPath();
                    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                    ctx.stroke();

                    continue;
                }

                let previous = -(Math.PI / 2);

                for (let section of sections) {
                    let amount = (Math.PI * 2) * (section.weight / total);

                    ctx.strokeStyle = section.color;
                    ctx.beginPath();
                    ctx.arc(circle.x, circle.y, circle.radius, previous, previous + amount);
                    ctx.stroke();

                    previous += amount;
                }
            }
        }

        ctx.restore();
    }

    if (typeof consumer == 'function') {
        consumer(ctx);
    }

    return canvas.toBuffer('image/png');
}

module.exports.replace = (text, values) => {
    return text.replace(
        /(%[a-zA-Z0-9._]+%)/g,
        match => {
            let property,
                object = values,
                path = match.substring(1, match.length - 1).split('.');

            while (property = path.shift()) {
                if (!object.hasOwnProperty(property)) {
                    return "?";
                }

                object = object[property];
            }

            return object;
        }
    );
}
