package com.qdc.plugins.alipay;

import java.security.MessageDigest;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.alipay.sdk.app.PayTask;

/**
 * 支付宝支付插件
 * 
 * @author NCIT
 * 
 */
public class Alipay extends CordovaPlugin {
	/** JS回调接口对象 */
	public static CallbackContext cbContext = null;

	/** LOG TAG */
	private static final String LOG_TAG = Alipay.class.getSimpleName();

	/**
	 * 插件主入口
	 */
	@Override
	public boolean execute(String action, final JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		LOG.d(LOG_TAG, "Alipay#execute");

		boolean ret = false;

		if ("payment".equalsIgnoreCase(action)) {
			LOG.d(LOG_TAG, "Alipay#payment.start");

			cbContext = callbackContext;

			PluginResult pluginResult = new PluginResult(
					PluginResult.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			callbackContext.sendPluginResult(pluginResult);

			// 参数检查
			if (args.length() != 1) {
				LOG.e(LOG_TAG, "args is empty", new NullPointerException());
				ret = false;
				PluginResult result = new PluginResult(
						PluginResult.Status.ERROR, "args is empty");
				result.setKeepCallback(true);
				cbContext.sendPluginResult(result);
				return ret;
			}

			JSONObject jsonObj = args.getJSONObject(0);

			final String payInfo = jsonObj.getString("pay_info");
			if (payInfo == null || "".equals(payInfo)) {
				LOG.e(LOG_TAG, "pay_info is empty", new NullPointerException());
				ret = false;
				PluginResult result = new PluginResult(
						PluginResult.Status.ERROR, "pay_info is empty");
				result.setKeepCallback(true);
				cbContext.sendPluginResult(result);
				return ret;
			}

			final String sign = jsonObj.getString("sign");
			if (sign == null || "".equals(sign)) {
				LOG.e(LOG_TAG, "sign is empty", new NullPointerException());
				ret = false;
				PluginResult result = new PluginResult(
						PluginResult.Status.ERROR, "sign is empty");
				result.setKeepCallback(true);
				cbContext.sendPluginResult(result);
				return ret;
			}

			if (!isSameSignature(payInfo, sign)) {
				LOG.e(LOG_TAG, "pay_info sign failure.",
						new IllegalStateException());
				ret = false;
				PluginResult result = new PluginResult(
						PluginResult.Status.ERROR, "pay_info sign failure.");
				result.setKeepCallback(true);
				cbContext.sendPluginResult(result);
				return ret;
			}

			Runnable payRunnable = new Runnable() {

				@Override
				public void run() {
					// 构造PayTask 对象
					PayTask alipay = new PayTask(cordova.getActivity());

					// 查询终端设备是否存在支付宝认证账户
					boolean isExist = alipay.checkAccountIfExist();
					if (!isExist) {
						LOG.e(LOG_TAG, "alipay account is not exists",
								new IllegalStateException());
						PluginResult result = new PluginResult(
								PluginResult.Status.ERROR,
								"alipay account is not exists");
						result.setKeepCallback(true);
						cbContext.sendPluginResult(result);
						return;
					}

					// 调用支付接口
					String resultMsg = alipay.pay(payInfo);
					LOG.i(LOG_TAG, ">>>>>>>>>>支付回调通知>>>>>>>>>>>");
					LOG.i(LOG_TAG, resultMsg);
					LOG.i(LOG_TAG, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

					String[] resArr = resultMsg.split(";");
					JSONObject resJo = new JSONObject();
					for (String res : resArr) {
						String[] ress = res.split("=");
						String key = ress[0];
						String value = ress[1].substring(1,
								ress[1].length() - 1);
						try {
							resJo.put(key, value);
						} catch (JSONException e) {
							LOG.e(LOG_TAG, e.getMessage(), e);
						}
					}

					PluginResult result = new PluginResult(
							PluginResult.Status.OK, resJo.toString());
					result.setKeepCallback(true);
					cbContext.sendPluginResult(result);
				}
			};

			// 此处必须通过启动线程调起支付
			Thread payThread = new Thread(payRunnable);
			payThread.start();

			LOG.d(LOG_TAG, "Alipay#payment.end");
			return true;
		}

		return true;
	}

	/**
	 * 判断签名是否一致
	 * 
	 * @param orign
	 *            原始值
	 * @param sign
	 *            签名
	 * @return 一致:true
	 */
	private boolean isSameSignature(String orign, String sign) {
		char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
				'A', 'B', 'C', 'D', 'E', 'F' };
		try {
			byte[] btInput = orign.getBytes("UTF-8");
			// 获得MD5摘要算法的 MessageDigest 对象
			MessageDigest mdInst = MessageDigest.getInstance("MD5");
			// 使用指定的字节更新摘要
			mdInst.update(btInput);
			// 获得密文
			byte[] md = mdInst.digest();
			// 把密文转换成十六进制的字符串形式
			int j = md.length;
			char str[] = new char[j * 2];
			int k = 0;
			for (int i = 0; i < j; i++) {
				byte byte0 = md[i];
				str[k++] = hexDigits[byte0 >>> 4 & 0xf];
				str[k++] = hexDigits[byte0 & 0xf];
			}

			return new String(str).equals(sign);
		} catch (Exception e) {
			LOG.e(LOG_TAG, e.getMessage(), e);
			return false;
		}
	}

}
