webpackJsonp([11],{2112:function(e,t,n){var a=n(0),s=n(91),o=n(447).PageRenderer;o.__esModule&&(o=o.default);var r=s({displayName:"WrappedPageRenderer",getInitialState:function(){return{content:n(2184)}},componentWillMount:function(){},render:function(){return a.createElement(o,Object.assign({},this.props,{content:this.state.content}))}});r.__catalog_loader__=!0,e.exports=r},2184:function(e,t){e.exports="## Share Dialog with default footer\n\n```react\nshowSource: true\nstate: { isOpen: false, shareUrl: 'https://examplecommunity.church/', message: 'Checkout our awesome church website' }\n---\n<ModalDemo>\n\t<Button variant=\"primary\" size=\"medium\" onClick={() => setState({ isOpen: true })}>Open a modal!</Button>\n\t<ShareDialog\n\t\tisOpen={state.isOpen}\n\t\tshareUrl={state.shareUrl}\n\t\tmessage={state.message}\n\t\tonClose={() => setState({ isOpen: false })}\n\t/>\n</ModalDemo>\n```\n"}});
//# sourceMappingURL=11.b3132da6.chunk.js.map