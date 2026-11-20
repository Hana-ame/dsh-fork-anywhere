# dsh-fork-anywhere

在任意历史回合处分叉（分叉到该回合结束处）：每个已完成回合的尾部加一个「分叉」按钮，不受 DSH 原生分叉按钮「对话最后一条才可用」的限制。原会话不变，新分支独立。

## 用法

任一历史回合的 actions 行会出现「分叉」按钮，点击即从该回合结尾开一个独立子会话。

## 布局

```
index.js           Host 半：/branch-anywhere 端点
client.js          Client 半：assistant-actions 插槽注入分叉按钮
cordis.patch.yml   bundle patch
package.json
```

## 说明

- 事件粒度：按 event seq 分叉，message 内的 block 无独立 seq。
- 已留档（2026-11-01，改宿主 patch）；如需外部版本化建议先确认当前挂载状态。
