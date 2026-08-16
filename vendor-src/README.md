# Vendored map generator source

`azgaar-fantasy-map-generator` is the official
[Azgaar Fantasy Map Generator](https://github.com/Azgaar/Fantasy-Map-Generator)
source, pinned to commit `992246f213b13146595d0eceb7cac7e2c7cf6586`
(upstream version `1.143.2`).

The generated Firebase-hosted application is copied to
`public/vendor/azgaar`. Rebuild it from the repository root with:

```powershell
.\scripts\build-azgaar.ps1
```

The upstream checkout is intentionally ignored by this repository so its
nested Git history and build dependencies are not committed. To recreate it:

```powershell
git clone --filter=blob:none https://github.com/Azgaar/Fantasy-Map-Generator.git vendor-src/azgaar-fantasy-map-generator
git -C vendor-src/azgaar-fantasy-map-generator checkout 992246f213b13146595d0eceb7cac7e2c7cf6586
```

Azgaar Fantasy Map Generator is distributed under the MIT License. Its
license and vendor metadata are included with the hosted build.
