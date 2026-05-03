package com.msgbyte.tailchat;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.Method;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          if (BuildConfig.ENABLE_GETUI_PUSH) {
            try {
              Class<?> getuiPackageClass = Class.forName("com.msgbyte.tailchat.GetuiPackage");
              ReactPackage getuiPackage = (ReactPackage) getuiPackageClass.getDeclaredConstructor().newInstance();
              packages.add(getuiPackage);
            } catch (Exception e) {
              e.printStackTrace();
            }
          }
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.ENABLE_GETUI_PUSH) {
      try {
        Class<?> getuiModuleClass = Class.forName("com.msgbyte.tailchat.GetuiModule");
        Method initPushMethod = getuiModuleClass.getMethod("initPush", android.content.Context.class);
        initPushMethod.invoke(null, this);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }
}
