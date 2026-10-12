/* A textured WebGL Earth for the hero. No framework or build step required. */
(function () {
  var canvas = document.getElementById("earth-canvas");
  var orbit = document.getElementById("earth-orbit");
  var fallback = document.getElementById("earth-fallback");
  var status = document.getElementById("earth-status");
  if (!canvas || !orbit) return;

  var gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "low-power" });
  var dayTextureUrl = "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/textures/planets/earth_atmos_2048.jpg";
  var nightTextureUrl = "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/textures/planets/earth_lights_2048.png";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  }

  function useFallback(message) {
    orbit.classList.add("fallback");
    if (fallback) fallback.hidden = false;
    setStatus(message || "Earth imagery unavailable");
  }

  if (!gl) {
    useFallback("3D globe unavailable");
    return;
  }

  var vertexSource = [
    "attribute vec3 aPosition;",
    "attribute vec2 aUv;",
    "uniform mat4 uProjection;",
    "uniform mat4 uModelView;",
    "varying vec2 vUv;",
    "varying vec3 vNormal;",
    "varying vec3 vViewPosition;",
    "void main() {",
    "  vec4 viewPosition = uModelView * vec4(aPosition, 1.0);",
    "  vUv = aUv;",
    "  vNormal = mat3(uModelView) * aPosition;",
    "  vViewPosition = viewPosition.xyz;",
    "  gl_Position = uProjection * viewPosition;",
    "}"
  ].join("\n");

  var fragmentSource = [
    "precision mediump float;",
    "uniform sampler2D uDayMap;",
    "uniform sampler2D uNightMap;",
    "uniform vec3 uLightDirection;",
    "varying vec2 vUv;",
    "varying vec3 vNormal;",
    "varying vec3 vViewPosition;",
    "void main() {",
    "  vec3 normal = normalize(vNormal);",
    "  vec3 viewDirection = normalize(-vViewPosition);",
    "  float sun = dot(normal, normalize(uLightDirection));",
    "  float daylight = smoothstep(-0.17, 0.2, sun);",
    "  vec3 mapColor = pow(max(texture2D(uDayMap, vUv).rgb, 0.003), vec3(2.2));",
    "  vec3 cityLights = texture2D(uNightMap, vUv).rgb;",
    "  float ocean = step(mapColor.r * 1.16, mapColor.b) * step(mapColor.g * 1.04, mapColor.b);",
    "  float glint = pow(max(dot(reflect(-normalize(uLightDirection), normal), viewDirection), 0.0), 26.0) * ocean * 0.16;",
    "  vec3 dayColor = mapColor * (0.12 + 1.08 * max(sun, 0.0)) + vec3(glint);",
    "  vec3 nightColor = mapColor * 0.1 + cityLights * vec3(2.8, 1.55, 0.7);",
    "  vec3 color = mix(nightColor, dayColor, daylight);",
    "  float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.4);",
    "  color += vec3(0.055, 0.2, 0.48) * rim * 0.9;",
    "  gl_FragColor = vec4(pow(max(color, 0.0), vec3(0.4545)), 1.0);",
    "}"
  ].join("\n");

  function compileShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error("Earth shader could not be compiled");
    }
    return shader;
  }

  function createProgram() {
    var program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Earth shader could not be linked");
    return program;
  }

  function createSphere(longitudes, latitudes) {
    var positions = [], uvs = [], indices = [];
    for (var row = 0; row <= latitudes; row++) {
      var lat = Math.PI / 2 - row / latitudes * Math.PI;
      var cosLat = Math.cos(lat), sinLat = Math.sin(lat);
      for (var col = 0; col <= longitudes; col++) {
        var u = col / longitudes;
        var lon = u * Math.PI * 2 - Math.PI;
        positions.push(cosLat * Math.sin(lon), sinLat, cosLat * Math.cos(lon));
        uvs.push(u, row / latitudes);
      }
    }
    for (var y = 0; y < latitudes; y++) {
      for (var x = 0; x < longitudes; x++) {
        var a = y * (longitudes + 1) + x;
        var b = a + longitudes + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return { positionBuffer: positionBuffer, uvBuffer: uvBuffer, indexBuffer: indexBuffer, count: indices.length };
  }

  function multiply(a, b) {
    var out = new Float32Array(16);
    for (var col = 0; col < 4; col++) {
      for (var row = 0; row < 4; row++) {
        var sum = 0;
        for (var k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
        out[col * 4 + row] = sum;
      }
    }
    return out;
  }

  function rotation(yaw, pitch, roll) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    var cr = Math.cos(roll), sr = Math.sin(roll);
    var ry = new Float32Array([cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]);
    var rx = new Float32Array([1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1]);
    var rz = new Float32Array([cr, sr, 0, 0, -sr, cr, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return multiply(ry, multiply(rx, rz));
  }

  function perspective(fov, aspect, near, far) {
    var f = 1 / Math.tan(fov / 2);
    var out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
  }

  function loadTexture(url, optional, onLoad) {
    var image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      onLoad(texture);
    };
    image.onerror = function () {
      if (!optional) useFallback("Earth imagery could not load");
    };
    image.src = url;
  }

  var program, sphere, dayTexture = null, nightTexture = null;
  var yaw = -0.37, pitch = 0.02, roll = 0.13;
  var velocityYaw = 0, velocityPitch = 0, dragging = false;
  var lastX = 0, lastY = 0, lastTime = 0, width = 0, height = 0, pixelRatio = 1;
  var visible = true, frame = 0, ready = false;

  try {
    program = createProgram();
    sphere = createSphere(112, 72);
  } catch (error) {
    useFallback("3D globe could not start");
    return;
  }

  var locations = {
    position: gl.getAttribLocation(program, "aPosition"),
    uv: gl.getAttribLocation(program, "aUv"),
    projection: gl.getUniformLocation(program, "uProjection"),
    modelView: gl.getUniformLocation(program, "uModelView"),
    dayMap: gl.getUniformLocation(program, "uDayMap"),
    nightMap: gl.getUniformLocation(program, "uNightMap"),
    light: gl.getUniformLocation(program, "uLightDirection")
  };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    var rect = orbit.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    start();
  }

  function render() {
    if (!ready || !width || !height) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.positionBuffer);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.uvBuffer);
    gl.enableVertexAttribArray(locations.uv);
    gl.vertexAttribPointer(locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indexBuffer);

    var model = rotation(yaw, pitch, roll);
    var view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -3.25, 1]);
    var modelView = multiply(view, model);
    var aspect = width / height;
    var globeFill = Math.min(1, aspect) * 0.86;
    var fov = 2 * Math.atan(1 / (3.25 * globeFill));
    var projection = perspective(fov, aspect, 0.1, 20);
    gl.uniformMatrix4fv(locations.modelView, false, modelView);
    gl.uniformMatrix4fv(locations.projection, false, projection);
    gl.uniform3f(locations.light, -0.58, 0.44, 0.78);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dayTexture);
    gl.uniform1i(locations.dayMap, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, nightTexture);
    gl.uniform1i(locations.nightMap, 1);
    gl.drawElements(gl.TRIANGLES, sphere.count, gl.UNSIGNED_SHORT, 0);
  }

  function animate(now) {
    frame = 0;
    var delta = lastTime ? Math.min((now - lastTime) / 16.67, 2) : 1;
    lastTime = now;
    if (!dragging && (Math.abs(velocityYaw) > 0.0002 || Math.abs(velocityPitch) > 0.0002)) {
      yaw += velocityYaw * delta;
      pitch = Math.max(-1.22, Math.min(1.22, pitch + velocityPitch * delta));
      velocityYaw *= Math.pow(0.94, delta);
      velocityPitch *= Math.pow(0.94, delta);
    } else if (!dragging && !reduceMotion && visible) {
      yaw += 0.0007 * delta;
    }
    render();
    if (visible && (dragging || (!reduceMotion && !document.hidden) || Math.abs(velocityYaw) > 0.0002 || Math.abs(velocityPitch) > 0.0002)) {
      frame = window.requestAnimationFrame(animate);
    } else lastTime = 0;
  }

  function start() {
    if (visible && ready && !frame) frame = window.requestAnimationFrame(animate);
  }

  function beginDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    velocityYaw = velocityPitch = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    start();
  }

  canvas.addEventListener("pointerdown", beginDrag);
  canvas.addEventListener("pointermove", function (event) {
    if (!dragging) return;
    var dx = event.clientX - lastX, dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    yaw += dx * 0.0045;
    pitch = Math.max(-1.22, Math.min(1.22, pitch + dy * 0.0045));
    velocityYaw = dx * 0.00072;
    velocityPitch = dy * 0.00072;
    render();
  });
  function endDrag() { dragging = false; start(); }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("lostpointercapture", endDrag);
  canvas.addEventListener("keydown", function (event) {
    var step = event.shiftKey ? 0.3 : 0.14;
    if (event.key === "ArrowLeft") yaw -= step;
    else if (event.key === "ArrowRight") yaw += step;
    else if (event.key === "ArrowUp") pitch = Math.min(1.22, pitch + step);
    else if (event.key === "ArrowDown") pitch = Math.max(-1.22, pitch - step);
    else return;
    event.preventDefault();
    render();
    start();
  });

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(orbit);
  else window.addEventListener("resize", resize);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting && !document.hidden;
      if (visible) { lastTime = 0; start(); }
      else if (frame) { window.cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    }, { threshold: 0.01 }).observe(orbit);
  }
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden && orbit.getBoundingClientRect().bottom > 0 && orbit.getBoundingClientRect().top < window.innerHeight;
    if (visible) { lastTime = 0; start(); }
    else if (frame) { window.cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  });
  if (window.matchMedia) {
    var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.addEventListener) motionPreference.addEventListener("change", function (event) { reduceMotion = event.matches; start(); });
  }

  resize();
  loadTexture(dayTextureUrl, false, function (texture) {
    dayTexture = texture;
    ready = true;
    setStatus("");
    render();
    start();
  });
  loadTexture(nightTextureUrl, true, function (texture) {
    nightTexture = texture;
    render();
  });
  var emptyNight = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, emptyNight);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  nightTexture = emptyNight;
  setStatus("Loading Earth imagery");
})();
