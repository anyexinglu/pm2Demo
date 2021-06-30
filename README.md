## 安装

`yarn global add pm2`

更多，可参考 https://pm2.keymetrics.io/docs/usage/quick-start/

## 启动

1、可以先试试 `node app.js` 是否成功：

➜ pm2demo git:(master) ✗ node app.js
Server running at http://127.0.0.1:8888/

2、`pm2 start app.js`，控制台会输出：

➜ pm2demo git:(master) ✗ pm2 start app.js
[PM2] Spawning PM2 daemon with pm2_home=/Users/yangxiayan/.pm2
[PM2] PM2 Successfully daemonized
[PM2] Starting /Users/yangxiayan/Documents/pm2demo/app.js in fork_mode (1 instance)
[PM2] Done.
┌─────┬────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name │ namespace │ version │ mode │ pid │ uptime │ ↺ │ status │ cpu │ mem │ user │ watching │
├─────┼────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┤
│ 0 │ app │ default │ N/A │ fork │ 65238 │ 0s │ 0 │ online │ 4% │ 18.0mb │ yan… │ disabled │
└─────┴────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┘

## manage

增加进程数：

```
pm2 scale app +3   // # Scales `app` up by 3 workers
```

其他指令：

```
pm2 monit // 监控，可以看到实例监控信息
pm2 restart app_name
pm2 reload app_name
pm2 stop app_name
pm2 delete app_name
```
