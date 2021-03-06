#include <pebble.h>

#include "config.h"

#include "modules/comm.h"
#include "modules/health.h"
#include "modules/data.h"
#include "modules/scheduler.h"

#include "windows/main_window.h"

static void upload_event() {
  // Get last minute data
  int num_records = data_reload_steps();

  if(num_records == 0) {
    APP_LOG(APP_LOG_LEVEL_INFO, "No new data");
    return;
  }

  // Send to JS
  if(connection_service_peek_pebble_app_connection()) {
    APP_LOG(APP_LOG_LEVEL_INFO, "Beginning upload...");
    comm_begin_upload(num_records);

    main_window_push();
    data_record_last_upload_time();
  } else {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Could not send data, connection unavailable");
  }
}

static void tick_handler(struct tm *tick_time, TimeUnits changed) {
  main_window_push();
}

static void init() {
  comm_init(64, 64);
  health_init();
  main_window_push();

  scheduler_begin(upload_event, INTERVAL_MINUTES);

  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
  time_t now = time(NULL);
  struct tm *time_now = localtime(&now);
  tick_handler(time_now, MINUTE_UNIT);
}

static void deinit() { }

int main() {
  init();
  app_event_loop();
  deinit();
}
