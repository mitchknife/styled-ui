webpackJsonp([14],{2110:function(t,e,n){var a=n(0),s=n(91),o=n(447).PageRenderer;o.__esModule&&(o=o.default);var i=s({displayName:"WrappedPageRenderer",getInitialState:function(){return{content:n(2182)}},componentWillMount:function(){},render:function(){return a.createElement(o,Object.assign({},this.props,{content:this.state.content}))}});i.__catalog_loader__=!0,t.exports=i},2182:function(t,e){t.exports="### Default theme\n\n```react\nshowSource: true\nstate: { isChecked: false }\n---\n<RadioDemo>\n\t<Radio\n\t\tonClick={() => setState({ isChecked: !state.isChecked })}\n\t\tisChecked={state.isChecked}\n\t\ttitle={'Click me'}\n\t\ttype=\"button\"\n\t/>\n</RadioDemo>\n```\n\n### Custom theme\n\n```react\nshowSource: true\nstate: { isChecked: false }\n---\n<RadioDemo>\n\t<Radio\n\t\tonClick={() => setState({ isChecked: !state.isChecked })}\n\t\tisChecked={state.isChecked}\n\t\ttitle={'Click me'}\n\t\ttheme={{\n\t\t\tprimary: 'darkslateblue',\n\t\t\tborder: 'plum',\n\t\t}}\n\t/>\n</RadioDemo>\n```\n\n### Custom label component\n\n```react\nshowSource: true\nstate: { isChecked: false }\n---\n<RadioDemo>\n\t<Radio\n\t\tonClick={() => setState({ isChecked: !state.isChecked })}\n\t\tisChecked={state.isChecked}\n\t\ttype=\"button\"\n\t>\n\t\t<span>No, click <b>me</b>!</span>\n\t</Radio>\n</RadioDemo>\n```\n\n### Disabled state\n\n```react\nshowSource: true\nstate: { isChecked: false }\n---\n<RadioDemo>\n\t<Radio\n\t\tonClick={() => setState({ isChecked: !state.isChecked })}\n\t\tisChecked={state.isChecked}\n\t\ttitle={'You can\\'t click me'}\n\t\ttype=\"button\"\n\t\tdisabled\n\t>\n\t</Radio>\n</RadioDemo>\n```\n"}});
//# sourceMappingURL=14.399092a3.chunk.js.map