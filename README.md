# cnblogs-helper

一个同步博客园随笔的工具。

# 安装

```bash
npm install -g cnblogs-helper
```

# 使用

## 初始化

### `cbh init`

```bash
cbh init [--reset]
```

-   说明：初始化博客园随笔同步工具
-   参数：
    -   `--reset` : 删除原有数据库，重新初始化

## 随笔

### `cbh post pull`

```bash
cbh post pull [--num <number>]
```

-   说明: 从博客园拉随笔到本地
-   参数：
    -   `--num` 从博客园拉随笔的个数（默认 200）

### `cbh post add`

```bash
cbh post add
```

-   说明: 本地随笔变动添加到数据暂存区

### `cbh post push`

```bash
cbh post push
```

-   说明: 将暂存区随笔变动推到博客园
