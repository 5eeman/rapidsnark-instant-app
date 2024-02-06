package com.rapidsnarkinstantapp

import android.content.Intent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.android.gms.instantapps.InstantApps

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "rapidsnarkAppClip"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  private fun showInstallPrompt() {
    val postInstall = Intent(Intent.ACTION_MAIN)
            .addCategory(Intent.CATEGORY_DEFAULT)
            .setPackage("com.rapidsnarkinstantapp")

    // The request code is passed to startActivityForResult().
    InstantApps.showInstallPrompt(this@MainActivity, postInstall, 0, /* referrer= */ null)
  }
}
