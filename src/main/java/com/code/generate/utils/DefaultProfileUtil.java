package com.code.generate.utils;

import org.springframework.boot.SpringApplication;
import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Map;

/**
 * 默认设置配置文件
 * Created by earl on 2017/3/25.
 */
public final class DefaultProfileUtil {

    private static final String SPRING_PROFILE_DEFAULT = "spring.profiles.default";

    //默认配置文件为开发环境
    private static final String SPRING_PROFILE_DEVELOPMENT = "dev";

    private DefaultProfileUtil() {
    }

    /**
     * 设置默认的配置文件
     * @param app the Spring application
     */
    public static void addDefaultProfile(SpringApplication app) {
        Map<String, Object> defProperties =  new HashMap<>();
        defProperties.put(SPRING_PROFILE_DEFAULT, SPRING_PROFILE_DEVELOPMENT);
        app.setDefaultProperties(defProperties);
    }

    /**
     * 获取配置文件列表名称，若没有返回默认的配置文件名称
     * @param env spring environment
     * @return profiles 配置文件
     */
    public static String[] getActiveProfiles(Environment env) {
        String[] profiles = env.getActiveProfiles();
        if (profiles.length == 0) {
            return env.getDefaultProfiles();
        }
        return profiles;
    }

}
