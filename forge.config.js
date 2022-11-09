module.exports = {
  packagerConfig: {
    "ignore": [
      "^/[.]vs$",
      "^/[.]angular$",
      "^/public$",
      "^/[.]browserslistrc$",
      "^/[.]editorconfig$",
      "^/tsconfig[.]json$"
    ],
    icon: 'icon.icns'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
