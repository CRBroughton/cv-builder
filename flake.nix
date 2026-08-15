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
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [
              pkgs.glib
              pkgs.pango
              pkgs.cairo
              pkgs.gdk-pixbuf
              pkgs.libffi
              pkgs.fontconfig
            ]}:$LD_LIBRARY_PATH"

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
      });
}
