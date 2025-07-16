let
  nixpkgs = builtins.getFlake "github:nixos/nixpkgs/nixpkgs-unstable";
  nixpkgs-review = builtins.getFlake "github:Mic92/nixpkgs-review/eda950b6dc10ae0aeaaaae6b98a55f0040de530e";
in

import nixpkgs {
  overlays = [ (final: prev: { inherit (nixpkgs-review.packages.${final.system}) nixpkgs-review; }) ];
}
