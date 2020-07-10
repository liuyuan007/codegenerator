package com.code.generate.config;

import org.beetl.core.resource.ClasspathResourceLoader;
import org.beetl.ext.spring.BeetlGroupUtilConfiguration;
import org.beetl.ext.spring.BeetlSpringViewResolver;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternUtils;

/**
 * beetl模板配置
 * Created by earl on 2017/3/20.
 */
@Configuration
public class BeetlTemplateConfig {



    @Value("${beetl.pagePath}")
    private String pagePath;


    @Value("${beetl.properties}")
    private String properties;



    /**
     * beetl页面模板参数配置
     */
    @Bean(initMethod = "init", name = "beetlConfig")
    public BeetlGroupUtilConfiguration getBeetlGroupUtilConfiguration( ) throws Exception {
        BeetlGroupUtilConfiguration beetlGroupUtilConfiguration = new BeetlGroupUtilConfiguration();
        ResourcePatternResolver patternResolver = ResourcePatternUtils.getResourcePatternResolver(new DefaultResourceLoader());
        try {
            //模板路径位置
            ClasspathResourceLoader cploder = new ClasspathResourceLoader(BeetlTemplateConfig.class.getClassLoader(),pagePath);
            beetlGroupUtilConfiguration.setResourceLoader(cploder);
            beetlGroupUtilConfiguration.setConfigFileResource(patternResolver.getResource(properties));
            return beetlGroupUtilConfiguration;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }



    /**
     * beetl页面视图配置
     */
    @Bean(name = "beetlViewResolver")
    public BeetlSpringViewResolver getBeetlSpringViewResolver(@Qualifier("beetlConfig")
                                                           BeetlGroupUtilConfiguration beetlGroupUtilConfiguration)throws Exception {
        BeetlSpringViewResolver beetlSpringViewResolver = new BeetlSpringViewResolver();
        beetlSpringViewResolver.setContentType("text/html;charset=UTF-8");
        beetlSpringViewResolver.setOrder(0);
        beetlSpringViewResolver.setConfig(beetlGroupUtilConfiguration);
        //页面模板后缀为.html格式 （不配置这个会导致项目启动后第一次访问页面空白）
        beetlSpringViewResolver.setSuffix(".html");
        return beetlSpringViewResolver;
    }


}