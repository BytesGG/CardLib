# CardLib
Node-canvas library for the creation of images from templates.

## Usage
This is packaged as a node module.
`npm install https://github.com/bytesgg/cardlib`

A explanation of the arguments for the function `create(template, values, consumer)`

- **template** - *json template for the card*
- **values** - *json object containing the placeholder values*
- **consumer** - *optional callback that takes the canvas context as a parameter, used for any additional custom rendering*

## Template

#### Width & Height
Both are required and must be of type `number`.

#### Fonts
Optional for including non-standard fonts for rendering use.
Json object with font-family name as the key and the font TTF file path as the value.

#### Panels
Array of json objects with the following properties.

- **x** - *`string/number defaults to 0`*
- **y** - *`string/number defaults to 0`*
- **width** - *`string/number defaults to 0` replaced with loaded image width if both width and height are 0*
- **height** - *`string/number defaults to 0`, replaced with loaded image height if both width and height are 0*
- **color** - *`string` hex code or placeholder to fill specified area (x, y, width, height)*
- **url** - *`string` image url, can be left blank to draw only a rectangle, can contain placeholders*
- **centered** - *`boolean` whether to center image on x/y coordinates*

#### Text
Array of json objects with the following properties.
Properties are continuous and will use previously set values if missing.

- **x** - *`number required`*
- **y** - *`number required`*
- **size** - *`number initially 10` font size to render*
- **value** - *`string required` text to render, can contain placeholders*
- **align** - *`string initially left` must be either left, right, or center*
- **color** - *`string initially #fff` hex code or placeholder to fill text*
- **family** - *`string initially 'sans-serif'` font family to use*

#### Circles (outline pie charts)
Array of json objects with the following properties.

- **x** - *`number required` center point*
- **y** - *`number required` center point*
- **width** - *`number required` line width*
- **radius** - *`number required` ...*
- **default** - *`string defaults to #000` hex code or placeholder used to draw if all sections total to 0*
- **sections** - *`array of Section` all sections of the circle*

#### Section
Used only for drawing circles.
If either value is invalid the section will be skipped.

- **color** - *`string required` can be placeholder*
- **weight** - *`string/number required` can be placeholder, must result in a number*

## Example
An example application can be found in `/example/`.
