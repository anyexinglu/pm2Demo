module.exports = {
  apps: [
    {
      script: "app.js",
      watch: ".",
      merge_logs: true,
      log_file: "/dev/null",
      out_file: "/dev/null",
      error_file: "/dev/null",
      min_uptime: 35000,
      max_memory_restart: "1200M",
      max_restarts: 10,
      exp_backoff_restart_delay: 1000,
      instances: 8,
      exec_mode: "cluster",
    },
  ],
};
