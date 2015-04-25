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


var en = `Election is comming tomorrow.
I'm going to go to nearby middle school from my place where I vote.
The more election day approach, the more candidates show up around station.
They are repeating their name again and again using a loudspeaker, so it's pretty noisy until election is finished.
Also it can be dangerous sometimes.
The other day, there was a candidate trying to shake hands with people who were just about to get on escalator of station! What if they fall into escalator...
He might be impatient to approach to voters,but I can't tell if he has common sence.
He should have looked around where he was...
`.split('\n');

var parts = ['+', '-', '+', 'f', 'f', '+', '-','-','+','-','-','+','f'];

var temp = [];
function isChange(part) {
  return part !== 'f';
}
function makeGroup(part) {
  temp.push({
    isChange: isChange(part),
    items: []
  });
}
parts.forEach((part, i) => {
  if (!temp.length) makeGroup(part);
  var group = temp[temp.length-1];
  if (isChange(part) === group.isChange) {
    group.items.push(part)
  } else {
    makeGroup(part);
    temp[temp.length-1].items.push(part);
  }
});
temp = temp.map(function (section) {
  if (!section.isChange) return section.items;
  return section.items.sort();
});
var merged = [];
merged = merged.concat.apply(merged, temp);

function diffSort(parts) {
  var temp = [];
  function isChange(part) {
    return part.added || part.removed;
  }
  function makeGroup(part) {
    temp.push({
      isChange: isChange(part),
      items: []
    });
  }
  console.log(parts.map(part => part.value));
  parts = parts.filter((part, i) => {
    if (part.value === ' ' && parts[i-1]) {
      parts[i-1] = parts[i-1].value += ' ';
      return false;
    } else {
      return true;
    }
  });
  parts.forEach((part, i) => {
    if (!temp.length) makeGroup(part);
    var group = temp[temp.length-1];
    if (isChange(part) === group.isChange) {
      group.items.push(part)
    } else {
      makeGroup(part);
      temp[temp.length-1].items.push(part);
    }
  });
  temp = temp.map(function (section) {
    if (!section.isChange) return section.items;
    return section.items.sort(function (a, b) {
      // Check this
      return a.removed === b.removed ? -1 : 1;
    });
  });
  parts = [];
  return parts.concat.apply(parts, temp);
}

var Editor = React.createClass({
  medium: null,
  getDefaultProps: function () {
    return {
      placeholder: 'Write something...'
    };
  },
  getInitialState: function () {
    return {
      currentText: ''
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
      mode: Medium.partialMode,
      placeholder: this.props.placeholder,
      beforeInsertHtml: function (e) {
        console.log(e, this);
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
    parts = diffSort(parts);
    return <ul className="diff">{parts.map(this.makeLi)}</ul>;
  },
  onChange: function (e) {
    console.log(this.medium.value());
    this.setState({
      currentText: this.medium.value()
    });
  },
  render: function () {
    return (<div>
      <div ref="editor" onKeyUp={this.onChange}>{this.props.originalText}</div>
      <div>{this.getDiff()}</div>
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
    return (<div className={className}>
      <img src="./img/mother.jpg" />
      <h3>In your country, what do you do on Mothers Day?</h3>
      <p>In Canada, most people give their mother a present.</p>
      {en.map(line => <Editor originalText={line} />)}
      <button onClick={this.toggleRemoved}>{removedLabel}</button>
      {lines.map(this.makeLine)}
    </div>);
  }
});

var skills = [
  {
    name: 'Fuckover Shooting +10',
    minRank: 4,
    class: 'Monk'
  },
  {
    name: 'Sing like an Angel',
    minRank: 3,
    class: 'Bard'
  }
];

var Jbuck = React.createClass({
  getInitialState: function() {
    return {
      rank: 0,
      class: ''
    };
  },
  buildLi: function (item) {
    var className = 'hide';
    if ((!this.state.rank || this.state.rank >= item.minRank) && (!this.state.class || item.class.toLowerCase().match(this.state.class.toLowerCase()))) className = '';
    return <tr className={className}><td>{item.name}</td><td>{item.class}</td><td>{item.minRank}</td></tr>;
  },
  setRank: function () {
    this.setState({rank: parseInt(event.target.value, 10)});
  },
  setClass: function () {
    this.setState({class: event.target.value});
  },
  render: function () {
    return (<div>
      <input type="number" value={this.state.rank} onKeyUp={this.setRank} onChange={this.setRank} />
      <input type="text" value={this.state.class} onKeyUp={this.setClass} onChange={this.setClass} />
      <table>
        <thead>
          <th>Skill</th>
          <th>Class</th>
          <th>Min Rank</th>
        </thead>
        {skills.map(this.buildLi)}
      </table>
    </div>);
  }
});

React.render(<div><Eg /></div>, document.getElementById('app'));
