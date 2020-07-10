package com.code.generate.utils;

import com.code.generate.config.PathYml;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.http.HttpServletRequest;

public final class PathUtil {

	private PathUtil(){}

	/**
	 * 获取域名根路径
	 * 
	 * @param request
	 * @return 返回domain+port
	 */
	public static String getDomainPath(HttpServletRequest request) {
		int port = request.getServerPort();
		String basePath = request.getScheme() + "://" + request.getServerName() + (port == 80 ? "" : ":" + port);
		return basePath;
	}

	/**
	 * 获取url根路径
	 * 
	 * @param domainPath
	 * @param contextPath
	 * @return 如果无contextPath,则返回domain+port/,否则返回(domain+port/contextPath/)
	 */
	public static String getWebRootPath(String domainPath, String contextPath) {
		if (StringUtils.equals(contextPath, PathYml.getContextPath() ) ) {
			//return domainPath + "/";
			return "/";
		}
		return domainPath + contextPath + "/";
//		return contextPath + "/";
	}

	/**
	 * 返回一个请求完整的路径
	 * 
	 * @param domainPath
	 * @param request
	 * @return domain+port+requestURI+queryString
	 */
	public static String getFullPath(String domainPath, HttpServletRequest request) {
		String url = domainPath + request.getRequestURI();
		String params = request.getQueryString();
		if (params != null && !"".equals(params)) {
			url = url + "?" + params;
		}
		return url;
	}


}
