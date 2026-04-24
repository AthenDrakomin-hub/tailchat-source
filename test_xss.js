const { FilterXSS, getDefaultWhiteList } = require('xss');

const xss = new FilterXSS({
  css: false,
  whiteList: { ...getDefaultWhiteList(), iframe: ['src', 'style', 'class'] },
  onIgnoreTag: function (tag, html, options) {
    if (['html', 'body', 'head', 'meta', 'style', 'div'].includes(tag)) {
      return html;
    }
  },
});

const html = '<div style="color:red"><span style="color:blue">Hello</span><p style="margin:10px">World</p></div>';
console.log(xss.process(html));
