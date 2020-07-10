package com.code.generate.config;

import com.code.generate.utils.PathUtil;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

/**
 * 项目路径、页面属性配置类
 */
@Component
@ConfigurationProperties("path")
public final class PathYml {


	private static boolean isInit = false;

	/**
	 * 项目的url访问名称,格式如:/oa
	 */
	private static String contextPath;

	/**
	 * 项目的根路径url.格式如: 192.168.10.191:8080
	 */
	private static String rootPath;

	//初始化项目路径相关配置
	public static void init(HttpServletRequest request) {
		String domainPath = PathUtil.getDomainPath(request);
		String contextPath = request.getContextPath();
		rootPath = PathUtil.getWebRootPath(domainPath, contextPath);
		if (rootPath.endsWith("/")) {
			rootPath = rootPath.substring(0, rootPath.length() - 1);
		}
		//设置为已经初始化
		isInit = true;
	}

	/**
	 * 是否已经初始化
	 *
	 * @return true表示是
	 */
	public static boolean isInit() {
		return isInit;
	}


	public static String getRootPath() {
		return rootPath;
	}

	public static void setRootPath(String rootPath) {
		PathYml.rootPath = rootPath;
	}

	public static String getContextPath() {
		return contextPath;
	}

	public static void setContextPath(String contextPath) {
		PathYml.contextPath = contextPath;
	}
}
