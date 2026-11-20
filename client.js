/**
 * dsh-fork-anywhere — fork at any historical turn.
 *
 * DSH 原生分叉按钮挂在 turn 尾部的 MessageIconActions 上，但
 * `branchUnavailable: data.branchUnavailable || hasLaterChatNode` 会让“后面还有
 * 内容”的历史回合不可分叉，于是实际只能在对话最后一条分叉。
 *
 * 本插件在 `conversation.chat.turnTail`（list slot，ownerProps 直接给
 * `seq` = 该回合收尾事件 seq，standardProps 给 `sessionId`）加一个独立按钮，
 * 调用原生 Client 服务 `ctx.sessions.fork({ sessionId, atSeq })` —— Host 侧
 * `session/fork` 本来就接受任意已存在的 seq（含开着的回合，会补 synthetic
 * closers），所以不需要任何 Host 新代码。
 *
 * 语义：保留到该回合结束为止的历史，复制成一个独立子会话；源会话不变。
 */

window.__ModuleLoader__.load({
  id: 'dsh-fork-anywhere',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    /** Cordis Client context captured by apply(); the slot component needs it for services. */
    let pluginCtx = null;

    const CSS = `
.dsh-fork-anywhere-row{display:inline-flex;align-items:center;gap:6px;min-width:0}
.dsh-fork-anywhere-btn{
  appearance:none;box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;
  height:22px;padding:0 8px;border-radius:var(--dsw-radius-xs,4px);
  border:.5px solid var(--dsw-alias-border-l1,transparent);
  background:transparent;color:var(--dsw-alias-label-secondary,#666);
  font:inherit;font-size:12px;line-height:20px;cursor:pointer;white-space:nowrap;
}
.dsh-fork-anywhere-btn:hover:not(:disabled){
  background:var(--dsw-alias-button-ghost-active-fill,rgba(0,0,0,.06));
  color:var(--dsw-alias-label-primary,#111);
}
.dsh-fork-anywhere-btn:focus-visible{outline:2px solid var(--dsw-alias-focus-ring,#4d6bfe);outline-offset:1px}
.dsh-fork-anywhere-btn:disabled{opacity:.55;cursor:default}
.dsh-fork-anywhere-error{font-size:11px;color:var(--dsw-alias-state-error-primary,#c33);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

    function ForkHere(props) {
      const sessionId = props.sessionId;
      const seq = props.seq;
      const [phase, setPhase] = React.useState('idle');
      const [error, setError] = React.useState('');

      const onClick = React.useCallback(async () => {
        if (phase === 'busy' || sessionId === undefined || seq === undefined) return;
        setPhase('busy');
        setError('');
        try {
          const childId = await pluginCtx.sessions.fork({ sessionId, atSeq: seq, increaseTitle: true });
          // 打开新分支；服务缺失时至少让用户知道分叉已成功。
          pluginCtx.uiWorkspace.openSession(childId);
          setPhase('idle');
        } catch (err) {
          setPhase('error');
          setError(err && err.message ? err.message : String(err));
        }
      }, [phase, sessionId, seq]);

      return h('span', { className: 'dsh-fork-anywhere-row' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('button', {
          type: 'button',
          className: 'dsh-fork-anywhere-btn',
          disabled: phase === 'busy',
          onClick,
          title: '从此回合处分叉：保留到这里为止的历史开一个独立分支，原会话不变',
        }, phase === 'busy' ? '分叉中…' : '分叉'),
        phase === 'error' ? h('span', { className: 'dsh-fork-anywhere-error', title: error }, '分叉失败') : null);
    }

    return {
      inject: ['slots', 'sessions', 'uiWorkspace'],
      apply(ctx) {
        pluginCtx = ctx;
        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
          name: 'conversation.chat.turnTail',
          id: 'fork-anywhere',
          order: 30,
        }, ForkHere));
      },
    };
  },
});