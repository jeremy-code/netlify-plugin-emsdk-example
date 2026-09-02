#include <stdio.h>
#include <emscripten.h>

int EMSCRIPTEN_KEEPALIVE hello_world()
{
  printf("Hello, world!\n");
  return 0;
}
