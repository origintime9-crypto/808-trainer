import { Component, type ReactNode } from 'react';
export class LoadBoundary extends Component<{children:ReactNode;resetKey:string},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidUpdate(previous:{resetKey:string}){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false});}
  render(){return this.state.failed?<section className="card" role="alert"><h2>页面暂时没能打开</h2><p>可能是网络中断或网站刚更新。已保存的学习记录仍在本机。</p><button className="primary" onClick={()=>window.location.reload()}>刷新重试</button><a className="button" href="#/settings">打开设置与备份</a></section>:this.props.children;}
}
