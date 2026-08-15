{
  description = "cv-builder dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        weasyLibs = with pkgs; [
          stdenv.cc.cc.lib
          glib
          pango
          cairo
          gdk-pixbuf
          libffi
          fontconfig
        ];

        runtimeBins = with pkgs; [ python312 uv bash coreutils ];

        startScript = pkgs.writeShellScript "cv-builder-start" ''
          set -e
          cd /app
          uv sync --no-dev
          exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            python312
            uv

            postgresql_16

            docker
            docker-compose
            just

            nodejs_22
            pnpm
          ];

          shellHook = ''
            echo "cv-builder dev shell — python $(python3 --version), uv $(uv --version), node $(node --version), pnpm $(pnpm --version)"

            # compiled Python wheels (e.g. greenlet) need libstdc++ on the loader path
            export LD_LIBRARY_PATH="${pkgs.stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH"

            # WeasyPrint needs gobject/pango/cairo system libs
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath weasyLibs}:$LD_LIBRARY_PATH"

            # Playwright bundled Chromium needs these system libs on NixOS
            unset PLAYWRIGHT_BROWSERS_PATH
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [
              pkgs.nspr
              pkgs.nss
              pkgs.alsa-lib
              pkgs.atk
              pkgs.at-spi2-atk
              pkgs.cups
              pkgs.libdrm
              pkgs.libgbm
              pkgs.expat
              pkgs.libxkbcommon
              pkgs.libx11
              pkgs.libxcomposite
              pkgs.libxcursor
              pkgs.libxdamage
              pkgs.libxext
              pkgs.libxfixes
              pkgs.libxi
              pkgs.libxrandr
              pkgs.libxrender
              pkgs.libxcb
              pkgs.gtk3
              pkgs.dbus
              pkgs.freetype
              pkgs.pango
              pkgs.cairo
              pkgs.glib
            ]}:$LD_LIBRARY_PATH"

            # docker CLI talks to the podman socket — no docker daemon on this host
            if [ -S "''${XDG_RUNTIME_DIR}/podman/podman.sock" ]; then
              export DOCKER_HOST="unix://''${XDG_RUNTIME_DIR}/podman/podman.sock"
            fi

            if [ -f pyproject.toml ]; then
              uv sync
            fi
          '';
        };

        packages.dockerImage = pkgs.dockerTools.buildLayeredImage {
          name = "cv-builder";
          tag = "latest";

          contents = runtimeBins ++ weasyLibs ++ [ pkgs.cacert ];

          config = {
            WorkingDir = "/app";
            ExposedPorts."8000/tcp" = {};
            Env = [
              "PATH=${pkgs.lib.makeBinPath runtimeBins}"
              "LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath weasyLibs}"
              "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
              "HOME=/root"
              "UV_CACHE_DIR=/tmp/uv-cache"
            ];
            Cmd = [ "${startScript}" ];
          };
        };
      });
}
