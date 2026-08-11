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

            nodejs_22
            pnpm
          ];

          shellHook = ''
            echo "cv-builder dev shell — python $(python3 --version), uv $(uv --version), node $(node --version), pnpm $(pnpm --version)"
          '';
        };
      });
}
