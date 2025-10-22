<template>
  <div class="tab-panel">
    <h2>Tree 组件 API 文档</h2>

    <!-- Props 文档 -->
    <div class="api-section">
      <h3>Props</h3>
      <div class="api-table-container">
        <table class="api-table">
          <thead>
            <tr>
              <th>参数</th>
              <th>说明</th>
              <th>类型</th>
              <th>可选值</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>data</td>
              <td>展示数据</td>
              <td>array</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>emptyText</td>
              <td>内容为空时的提示文本</td>
              <td>string</td>
              <td>—</td>
              <td>暂无数据</td>
            </tr>
            <tr>
              <td>nodeKey</td>
              <td>每个树节点用来作为唯一标识的属性，整棵树应该是唯一的</td>
              <td>string</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>props</td>
              <td>配置选项，具体看下表</td>
              <td>object</td>
              <td>—</td>
              <td>
                { children: 'children', label: 'label', disabled: 'disabled' }
              </td>
            </tr>
            <tr>
              <td>defaultExpandAll</td>
              <td>是否默认展开所有节点</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>defaultExpandedKeys</td>
              <td>默认展开的节点的 key 的数组</td>
              <td>array</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>expandOnClickNode</td>
              <td>
                是否在点击节点的时候展开或者收缩节点，默认值为 true，如果为
                false，则只有点箭头图标的时候才会展开或者收缩节点
              </td>
              <td>boolean</td>
              <td>—</td>
              <td>true</td>
            </tr>
            <tr>
              <td>highlightCurrent</td>
              <td>是否高亮当前选中节点，默认值是 false</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>renderContent</td>
              <td>树节点的内容区的渲染 Function</td>
              <td>function</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>currentNodeKey</td>
              <td>当前选中的节点的 key</td>
              <td>string, number</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>indent</td>
              <td>相邻级节点间的水平缩进，单位为像素</td>
              <td>number</td>
              <td>—</td>
              <td>18</td>
            </tr>
            <tr>
              <td>iconClass</td>
              <td>自定义树节点的图标</td>
              <td>string</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>showCheckbox</td>
              <td>节点是否可被选择</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>checkStrictly</td>
              <td>
                在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为
                false
              </td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>defaultCheckedKeys</td>
              <td>默认勾选的节点的 key 的数组</td>
              <td>array</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>checkOnClickNode</td>
              <td>
                是否在点击节点的时候选中节点，默认值为
                false，即只有在点击复选框时才会选中节点
              </td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>checkDescendants</td>
              <td>关联子节点是否被选中，默认为 false</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>autoExpandParent</td>
              <td>展开子节点的时候是否自动展开父节点</td>
              <td>boolean</td>
              <td>—</td>
              <td>true</td>
            </tr>
            <tr>
              <td>lazy</td>
              <td>是否懒加载子节点，需与 load 方法结合使用</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>load</td>
              <td>加载子树数据的方法，仅当 lazy 属性为true 时生效</td>
              <td>function</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>draggable</td>
              <td>是否开启拖拽节点功能</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>allowDrag</td>
              <td>判断节点能否被拖拽</td>
              <td>function</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>allowDrop</td>
              <td>拖拽时判定目标节点能否被放置</td>
              <td>function</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>filterNodeMethod</td>
              <td>
                对树节点进行筛选时执行的方法，返回 true
                表示这个节点可以显示，返回 false 则表示这个节点会被隐藏
              </td>
              <td>function</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>accordion</td>
              <td>是否每次只打开一个同级树节点展开</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>renderAfterExpand</td>
              <td>是否在第一次展开某个树节点后才渲染其子节点</td>
              <td>boolean</td>
              <td>—</td>
              <td>true</td>
            </tr>
            <tr>
              <td>keyboardFocus</td>
              <td>是否启用键盘导航焦点样式</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Props 子配置文档 -->
    <div class="api-section">
      <h3>props 子配置</h3>
      <div class="api-table-container">
        <table class="api-table">
          <thead>
            <tr>
              <th>参数</th>
              <th>说明</th>
              <th>类型</th>
              <th>可选值</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>children</td>
              <td>指定子树树的节点属性</td>
              <td>string</td>
              <td>—</td>
              <td>children</td>
            </tr>
            <tr>
              <td>label</td>
              <td>指定节点标签的属性</td>
              <td>string</td>
              <td>—</td>
              <td>label</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td>指定节点选择框是否禁用、节点是否可拖拽的属性</td>
              <td>string</td>
              <td>—</td>
              <td>disabled</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Events 文档 -->
    <div class="api-section">
      <h3>Events</h3>
      <div class="api-table-container">
        <table class="api-table">
          <thead>
            <tr>
              <th>事件名称</th>
              <th>说明</th>
              <th>回调参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>node-expand</td>
              <td>节点被展开时触发的事件</td>
              <td>(data, node, instance)</td>
            </tr>
            <tr>
              <td>node-collapse</td>
              <td>节点被关闭时触发的事件</td>
              <td>(data, node, instance)</td>
            </tr>
            <tr>
              <td>node-click</td>
              <td>节点被点击时的回调</td>
              <td>(data, node, instance)</td>
            </tr>
            <tr>
              <td>current-change</td>
              <td>当前选中节点变化时触发的事件</td>
              <td>(data, node)</td>
            </tr>
            <tr>
              <td>check</td>
              <td>当复选框被点击的时候触发</td>
              <td>
                (data, { checkedNodes, checkedKeys, halfCheckedNodes,
                halfCheckedKeys })
              </td>
            </tr>
            <tr>
              <td>check-change</td>
              <td>节点选中状态发生变化时触发</td>
              <td>(data, checked, indeterminate)</td>
            </tr>
            <tr>
              <td>node-drag-start</td>
              <td>节点开始拖拽时触发的事件</td>
              <td>(node, event)</td>
            </tr>
            <tr>
              <td>node-drag-enter</td>
              <td>拖拽进入其他节点时触发的事件</td>
              <td>(draggingNode, dropNode, event)</td>
            </tr>
            <tr>
              <td>node-drag-leave</td>
              <td>拖拽离开某个节点时触发的事件</td>
              <td>(draggingNode, dropNode, event)</td>
            </tr>
            <tr>
              <td>node-drag-over</td>
              <td>在拖拽节点时触发的事件（类似浏览器的 mouseover 事件）</td>
              <td>(draggingNode, dropNode, event)</td>
            </tr>
            <tr>
              <td>node-drag-end</td>
              <td>拖拽结束时（可能未成功）触发的事件</td>
              <td>(draggingNode, dropNode, dropType, event)</td>
            </tr>
            <tr>
              <td>node-drop</td>
              <td>拖拽成功完成时触发的事件</td>
              <td>(draggingNode, dropNode, dropType, event)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Methods 文档 -->
    <div class="api-section">
      <h3>Methods</h3>
      <div class="api-table-container">
        <table class="api-table">
          <thead>
            <tr>
              <th>方法名</th>
              <th>说明</th>
              <th>参数</th>
              <th>返回值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>filter</td>
              <td>对树节点进行筛选操作</td>
              <td>
                接受任意类型的参数，该参数会在 filter-node-method
                中作为第一个参数
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>updateKeyChildren</td>
              <td>通过 keys 设置某个子节点</td>
              <td>(key, data) 接收两个参数，1. 节点的 key，2. 新子节点数据</td>
              <td>—</td>
            </tr>
            <tr>
              <td>getCheckedNodes</td>
              <td>
                若节点可被选择（即 show-checkbox 为
                true），则返回目前被选中的节点所组成的数组
              </td>
              <td>
                (leafOnly, includeHalfChecked) 接收两个 boolean 类型的参数，1.
                是否只是叶子节点，默认值为 false，2. 是否包含半选节点，默认值为
                false
              </td>
              <td>array</td>
            </tr>
            <tr>
              <td>setCheckedNodes</td>
              <td>设置目前勾选的节点，使用此方法必须设置 node-key 属性</td>
              <td>(nodes) 接收勾选节点数据的数组</td>
              <td>—</td>
            </tr>
            <tr>
              <td>getCheckedKeys</td>
              <td>
                若节点可被选择（即 show-checkbox 为
                true），则返回目前被选中的节点的 key 所组成的数组
              </td>
              <td>
                (leafOnly) 接收一个 boolean 类型的参数，默认为 false，如果参数为
                true，它只返回叶子节点
              </td>
              <td>array</td>
            </tr>
            <tr>
              <td>setCheckedKeys</td>
              <td>
                通过 keys 设置目前选中的节点，使用此方法必须设置 node-key 属性
              </td>
              <td>
                (keys, leafOnly) 接收两个参数，1. 节点 key 的数组，2. boolean
                类型，是否只设置叶子节点，默认值为 false
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>setSelectedNodes</td>
              <td>设置目前选中的节点</td>
              <td>(nodes) 接收选中的节点数据数组</td>
              <td>—</td>
            </tr>
            <tr>
              <td>setCurrentNode</td>
              <td>设置当前选中的节点，使用此方法必须设置 node-key 属性</td>
              <td>(node) 待被选中的节点</td>
              <td>—</td>
            </tr>
            <tr>
              <td>getCurrentNode</td>
              <td>获取当前选中的节点</td>
              <td>—</td>
              <td>node</td>
            </tr>
            <tr>
              <td>setCurrentKey</td>
              <td>
                通过 key 设置某个节点的当前选中状态，使用此方法必须设置 node-key
                属性
              </td>
              <td>(key) 待被选中的节点的 key，若为 null 则取消当前选中节点</td>
              <td>—</td>
            </tr>
            <tr>
              <td>getCurrentKey</td>
              <td>获取当前被选中节点的 key，若没有节点被选中则返回 null</td>
              <td>—</td>
              <td>string | number | null</td>
            </tr>
            <tr>
              <td>getNode</td>
              <td>根据 data 或者 key 查找 Tree 组件中的节点</td>
              <td>(data) 要查找的节点的 data 或者 key</td>
              <td>node</td>
            </tr>
            <tr>
              <td>remove</td>
              <td>删除一个节点</td>
              <td>(data) 要删除的节点的数据或者 key</td>
              <td>—</td>
            </tr>
            <tr>
              <td>append</td>
              <td>为 Tree 中的一个节点追加一个子节点</td>
              <td>
                (data, parentNode) 接收两个参数，1. 新增节点的数据，2.
                父节点的数据、key 或 node 对象
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>insertBefore</td>
              <td>在 Tree 的指定节点前插入一个节点</td>
              <td>
                (data, refNode) 接收两个参数，1. 新增节点的数据，2.
                参考节点的数据、key 或 node 对象
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>insertAfter</td>
              <td>在 Tree 的指定节点后插入一个节点</td>
              <td>
                (data, refNode) 接收两个参数，1. 新增节点的数据，2.
                参考节点的数据、key 或 node 对象
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>getHalfCheckedNodes</td>
              <td>
                若节点可被选择（即 show-checkbox 为
                true），则返回目前半选中的节点所组成的数组
              </td>
              <td>—</td>
              <td>array</td>
            </tr>
            <tr>
              <td>getHalfCheckedKeys</td>
              <td>
                若节点可被选择（即 show-checkbox 为
                true），则返回目前半选中的节点的 key 所组成的数组
              </td>
              <td>—</td>
              <td>array</td>
            </tr>
            <tr>
              <td>setChecked</td>
              <td>设置节点是否被选中</td>
              <td>
                (data, checked, deep) 接收三个参数，1. 要选中的节点的数据或者
                key，2. boolean 类型，是否选中，3. boolean
                类型，是否向下递归选中子节点
              </td>
              <td>—</td>
            </tr>
            <tr>
              <td>getNodePath</td>
              <td>获取节点的路径</td>
              <td>(data) 节点的数据或者 key</td>
              <td>array</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 插槽文档 -->
    <div class="api-section">
      <h3>插槽 (Slots)</h3>
      <div class="api-table-container">
        <table class="api-table">
          <thead>
            <tr>
              <th>插槽名</th>
              <th>说明</th>
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>自定义树节点的内容，参数为 { node, data }</td>
              <td>
                <strong>node:</strong> TreeNode 对象<br />
                <strong>data:</strong> 节点的数据对象
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiFeatures',
}
</script>

<style scoped>
.api-section {
  margin-top: 30px;
}

.api-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.api-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.api-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}

.api-table th,
.api-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  word-break: break-word;
}

.api-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

.api-table tr:hover {
  background-color: #f5f7fa;
}

.code-example {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 20px;
}

.code-example h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #409eff;
}

.code-block {
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
}

.code-block code {
  background: none;
  padding: 0;
  border: none;
  color: inherit;
}
</style>
