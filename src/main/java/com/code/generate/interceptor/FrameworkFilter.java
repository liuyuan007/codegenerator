package com.code.generate.interceptor;


import com.code.generate.config.PathYml;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 *  通过此过滤器初始化路径或者其他配置
 * Created by earl on 2017/3/20.
 */
public class FrameworkFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (!PathYml.isInit()) {
            //初始化路径配置
            PathYml.init((HttpServletRequest) request);
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {

    }



}
