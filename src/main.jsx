var diff = require('diff');
var React = require('react');
var Medium = require('medium.js');

var lines = [
  ['今年カナダに母の日は ５月１０日です。', 'カナダでは、今年の母の日は５月１０日です。'],
  ['母の日に日本人と同様にカナダ人が母にプレゼントをあげます。', '母の日には日本人と同様に、カナダ人は母にプレゼントをあげます。'],
  ['其れにカードを書きます、そして、レストランで食べたり料理したりする。', 'そして、カードも書きます/添えます。レストランで食べたり、家で料理を作ったりすることもあります。'],
  ['去年私の家族はイタリアのレストランへ行きました。', '去年、私の家族はイタリアのレストランへ行きました。'],
  ['パスタを食べました、ワインレッドを飲みました。', 'パスタを食べました、ワインレッドを飲みました。'],
  ['残念ことに今年はお父が亡くなりましたので、母が悲しいです。', '残念なことに、今年はお父が亡くなりましたので、母はとても悲しそうです。'],
  ['したが, 母の日私は綺麗なプレゼントをあげたいです、一番美味料理をしたいです。', 'だから、 母の日に私はすてきなプレゼントをあげたいです。そして一番美味しい料理を作りたいです。'],
  ['幸せになりたいよ！', '母を幸せにしたいです！']
];

var js = `カナダでは、今年の母の日は５月１０日です。
母の日に日本人と同様にカナダ人がも母にプレゼントをあげます。
そして、カードも書きます/添えます。レストランで食べたり、家で料理を作ったりすることもあります。
去年、私の家族はイタリアのレストランへ行きました。
パスタを食べました。ワインレッドを飲みました。
とても美味しかったです！
なので, 母の日に私は綺麗なプレゼントをあげたいです、一番美味しい料理をしたいです。
母を幸せにしたいです！`.split('\n');

var en = `This year, Mother's Day is on May 10th in Canada.
Like Japanese people, Canadians also give presents to their mothers on Mother's day.
They also write cards to their mothers, and sometimes go out to a restaurant to eat or make dinner.
Last year, I went to an Italian restaurant with my family.
We ate pasta and drank red wine. It was really delicious!`.split('\n');


var Editor = React.createClass({
  medium: null,
  getDefaultProps: function () {
    return {
      placeholder: 'Write something...'
    };
  },
  getInitialState: function () {
    return {
      currentText: '',
      isEditing: false
    };
  },
  componentWillMount: function () {
    this.setState({
      currentText: this.props.originalText
    });
  },
  componentDidMount: function () {
    this.medium = new Medium({
      element: this.refs.editor.getDOMNode(),
      mode: Medium.inlineMode,
      placeholder: this.props.placeholder,
      keyContext: {
        enter: function (e, element) {
          element.blur();
        }
      }
    });
  },
  componentWillUnmount: function () {
    if (this.medium) this.medium.destroy();
  },
  makeLi: function (part) {
    var className = '';
    if (part.added) className = 'added';
    else if (part.removed) className = 'removed';
    return <li className={className}>{part.value}</li>;
  },
  getDiff: function () {
    var parts = diff.diffWords(this.props.originalText, this.state.currentText);
    return <ul className="diff">{parts.map(this.makeLi)}</ul>;
  },
  onChange: function (e) {
    this.setState({
      currentText: this.medium.value()
    });
  },
  getSelectionRange: function() {
    var selection;
    if (window.getSelection) {
      selection = window.getSelection();
      if (selection.rangeCount) {
        return selection.getRangeAt(0);
      }
    } else if (document.selection) {
      return document.selection.createRange();
    }
    return null;
  },
  onClick: function () {
    var range = this.getSelectionRange();
    console.log(range);
  },
  showEditor: function(show) {
    return () => {
      this.setState({
        isEditing: show
      });
    };
  },
  render: function () {
    return (<div className="line-container">
      <div className="line-editor" ref="editor" onClick={this.onClick} onKeyUp={this.onChange} onBlur={this.showEditor(false)}>{this.props.originalText}</div>
      <div className="line">{this.getDiff()}</div>
    </div>);
  }
});

var Eg = React.createClass({
  getInitialState: function () {
    return {
      showRemoved: true
    };
  },
  makeLi: function (part) {
    var className = '';
    if (part.added) className = 'added';
    else if (part.removed) className = 'removed';
    return <li className={className}>{part.value}</li>;
  },
  makeLine: function (line) {
    var parts = diff.diffChars(line[0], line[1]);
    return <ul className="diff">{parts.map(this.makeLi)}</ul>;
  },
  toggleRemoved: function (e) {
    e.preventDefault();
    this.setState({showRemoved : !this.state.showRemoved});
  },
  render: function () {
    var removedLabel = this.state.showRemoved ? 'Hide Removed' : 'Show Removed';
    var className = this.state.showRemoved ? '' : 'removed-off';
    // <button onClick={this.toggleRemoved}>{removedLabel}</button>
    // {lines.map(this.makeLine)}
    return (<div className={className}>
      <img src="./img/mother.jpg" />
      <h3>Mother&rsquo;s Day</h3>
      {en.map((line, i) => <Editor key={i} originalText={line} />)}
    </div>);
  }
});


React.render(<div><Eg /></div>, document.getElementById('app'));
